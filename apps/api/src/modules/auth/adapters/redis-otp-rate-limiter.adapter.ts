import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { OtpRateLimiterPort, RateLimitResult } from '../ports/auth.service.port';
import { normalizePhoneNumber } from './twilio-sms.adapter';

@Injectable()
export class RedisOtpRateLimiterAdapter implements OtpRateLimiterPort, OnModuleDestroy {
  private readonly logger = new Logger(RedisOtpRateLimiterAdapter.name);
  private redisClient: Redis | null = null;
  private readonly maxRequests = 3;
  private readonly windowSeconds = 600; // 10 minutos

  // Fallback em memória caso o Redis não esteja configurado ou caia temporariamente
  private memoryStore: Map<string, { count: number; expiresAt: number }> = new Map();

  constructor() {
    this.initRedis();
  }

  private initRedis() {
    try {
      const host = process.env.REDIS_HOST || 'localhost';
      const port = Number(process.env.REDIS_PORT) || 6379;

      this.redisClient = new Redis({
        host,
        port,
        password: process.env.REDIS_PASSWORD || undefined,
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        retryStrategy: () => null, // Não trava o processo se Redis estiver offline
      });

      this.redisClient.on('error', (err) => {
        // Silencia erro para não poluir logs quando operando em fallback
        this.logger.warn(`[OTP RateLimiter] Redis indisponível (${err.message}). Utilizando fallback em memória.`);
      });
    } catch {
      this.redisClient = null;
    }
  }

  async checkAndIncrement(phone: string): Promise<RateLimitResult> {
    const normalizedPhone = normalizePhoneNumber(phone);
    const key = `otp:ratelimit:${normalizedPhone}`;

    // 1. Tentar verificar via Redis
    if (this.redisClient && this.redisClient.status === 'ready') {
      try {
        const count = await this.redisClient.incr(key);
        if (count === 1) {
          await this.redisClient.expire(key, this.windowSeconds);
        }

        const ttl = await this.redisClient.ttl(key);
        const retryAfterSeconds = ttl > 0 ? ttl : this.windowSeconds;

        if (count > this.maxRequests) {
          return {
            allowed: false,
            remainingAttempts: 0,
            retryAfterSeconds,
          };
        }

        return {
          allowed: true,
          remainingAttempts: Math.max(0, this.maxRequests - count),
        };
      } catch (err: any) {
        this.logger.warn(`[OTP RateLimiter] Falha de comunicação Redis: ${err.message}. Alternando para fallback em memória.`);
      }
    }

    // 2. Fallback Resiliente em Memória
    const now = Date.now();
    const entry = this.memoryStore.get(key);

    if (entry && entry.expiresAt > now) {
      entry.count += 1;
      const retryAfterSeconds = Math.ceil((entry.expiresAt - now) / 1000);

      if (entry.count > this.maxRequests) {
        return {
          allowed: false,
          remainingAttempts: 0,
          retryAfterSeconds,
        };
      }

      return {
        allowed: true,
        remainingAttempts: Math.max(0, this.maxRequests - entry.count),
      };
    }

    // Nova janela
    this.memoryStore.set(key, {
      count: 1,
      expiresAt: now + this.windowSeconds * 1000,
    });

    // Limpeza de entradas expiradas da memória a cada chamada
    if (this.memoryStore.size > 500) {
      for (const [k, v] of this.memoryStore.entries()) {
        if (v.expiresAt <= now) {
          this.memoryStore.delete(k);
        }
      }
    }

    return {
      allowed: true,
      remainingAttempts: this.maxRequests - 1,
    };
  }

  // Método auxiliar para testes e resets
  reset(phone: string) {
    const normalized = normalizePhoneNumber(phone);
    this.memoryStore.delete(`otp:ratelimit:${normalized}`);
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      try {
        this.redisClient.disconnect();
      } catch {
        // Ignora
      }
    }
  }
}


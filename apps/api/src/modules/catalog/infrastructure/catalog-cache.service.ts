import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CatalogCacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CatalogCacheService.name);
  private redisClient: Redis | null = null;
  private readonly ttlSeconds = 3600; // 1 hora de cache
  private memoryCache: Map<string, { data: any; expiresAt: number }> = new Map();

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
        retryStrategy: () => null,
      });

      this.redisClient.on('error', (err) => {
        this.logger.warn(`[CatalogCache] Redis indisponível (${err.message}). Utilizando fallback em memória.`);
      });
    } catch {
      this.redisClient = null;
    }
  }

  private getKey(category?: string): string {
    return `catalog:services:${category || 'all'}`;
  }

  async get<T>(category?: string): Promise<T | null> {
    const key = this.getKey(category);

    if (this.redisClient && this.redisClient.status === 'ready') {
      try {
        const raw = await this.redisClient.get(key);
        if (raw) {
          return JSON.parse(raw);
        }
      } catch {
        // Fallback
      }
    }

    const item = this.memoryCache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }
    return item.data as T;
  }

  async set(category: string | undefined, data: any): Promise<void> {
    const key = this.getKey(category);

    if (this.redisClient && this.redisClient.status === 'ready') {
      try {
        await this.redisClient.set(key, JSON.stringify(data), 'EX', this.ttlSeconds);
        return;
      } catch {
        // Fallback
      }
    }

    this.memoryCache.set(key, {
      data,
      expiresAt: Date.now() + this.ttlSeconds * 1000,
    });
  }

  async clear(category?: string): Promise<void> {
    if (category && category !== 'all') {
      const key = this.getKey(category);
      if (this.redisClient && this.redisClient.status === 'ready') {
        try {
          await this.redisClient.del(key);
        } catch {
          // Fallback
        }
      }
      this.memoryCache.delete(key);
      return;
    }

    if (this.redisClient && this.redisClient.status === 'ready') {
      try {
        const keys = await this.redisClient.keys('catalog:services:*');
        if (keys.length > 0) {
          await this.redisClient.del(...keys);
        }
      } catch {
        // Ignora
      }
    }
    this.memoryCache.clear();
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

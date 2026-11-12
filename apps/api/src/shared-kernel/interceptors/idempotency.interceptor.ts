import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  Logger,
  OnModuleDestroy,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import Redis from 'ioredis';

export interface IdempotentStoredPayload {
  statusCode: number;
  body: any;
  timestamp: string;
}

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor, OnModuleDestroy {
  private readonly logger = new Logger(IdempotencyInterceptor.name);
  private redisClient: Redis | null = null;
  private readonly ttlSeconds = 300; // 5 minutos de retenção

  // Fallback em memória caso o Redis esteja indisponível (ex: testes locais sem container)
  private memoryCache: Map<string, { value: string; expiresAt: number }> = new Map();

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
        this.logger.warn(`[Idempotency] Redis indisponível (${err.message}). Utilizando fallback em memória.`);
      });
    } catch {
      this.redisClient = null;
    }
  }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const httpContext = context.switchToHttp();
    const req = httpContext.getRequest();
    const res = httpContext.getResponse();

    // Idempotência se aplica primariamente a mutações (POST, PUT, PATCH)
    const method = req.method?.toUpperCase();
    if (!['POST', 'PUT', 'PATCH'].includes(method)) {
      return next.handle();
    }

    const idempotencyKey = (
      req.headers['idempotency-key'] ||
      req.headers['x-idempotency-key'] ||
      ''
    ).toString().trim();

    // Se o cliente não forneceu a chave de idempotência, executa normalmente
    if (!idempotencyKey) {
      return next.handle();
    }

    const redisKey = `idempotency:${idempotencyKey}`;

    // 1. Verificar se a chave já existe e qual o estado
    const existing = await this.getStorage(redisKey);

    if (existing) {
      if (existing === 'PROCESSING') {
        throw new HttpException(
          'Requisição com esta chave de idempotência já está em processamento. Por favor, aguarde.',
          HttpStatus.CONFLICT,
        );
      }

      try {
        const parsed: IdempotentStoredPayload = JSON.parse(existing);
        res.setHeader('X-Idempotent-Replay', 'true');
        res.setHeader('X-Idempotent-Key', idempotencyKey);
        res.status(parsed.statusCode || HttpStatus.OK);
        return of(parsed.body);
      } catch (e) {
        this.logger.error(`[Idempotency] Erro ao deserializar payload da chave ${idempotencyKey}: ${e}`);
      }
    }

    // 2. Tentar reservar a chave atômica com estado PROCESSING
    const acquired = await this.setStorageNx(redisKey, 'PROCESSING', this.ttlSeconds);
    if (!acquired) {
      throw new HttpException(
        'Conflito de concorrência: Requisição idêntica recebida simultaneamente.',
        HttpStatus.CONFLICT,
      );
    }

    // 3. Executar UseCase / Handler e salvar resultado no sucesso ou liberar chave no erro
    return next.handle().pipe(
      tap(async (responseBody) => {
        try {
          const statusCode = res.statusCode || HttpStatus.OK;
          const payload: IdempotentStoredPayload = {
            statusCode,
            body: responseBody,
            timestamp: new Date().toISOString(),
          };
          await this.setStorage(redisKey, JSON.stringify(payload), this.ttlSeconds);
          res.setHeader('X-Idempotent-Key', idempotencyKey);
        } catch (err: any) {
          this.logger.error(`[Idempotency] Erro ao gravar resposta no storage: ${err.message}`);
        }
      }),
      catchError(async (err) => {
        // Se a operação lançar erro de negócio ou falha, removemos a trava para permitir re-tentativa com correção
        await this.delStorage(redisKey);
        throw err;
      }),
    );
  }

  // --- Operações Abstratas de Storage (Redis com Fallback em Memória) ---

  private async getStorage(key: string): Promise<string | null> {
    if (this.redisClient && this.redisClient.status === 'ready') {
      try {
        return await this.redisClient.get(key);
      } catch {
        // Fallback silencioso para memória
      }
    }

    const item = this.memoryCache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }
    return item.value;
  }

  private async setStorageNx(key: string, value: string, ttlSeconds: number): Promise<boolean> {
    if (this.redisClient && this.redisClient.status === 'ready') {
      try {
        const result = await this.redisClient.set(key, value, 'EX', ttlSeconds, 'NX');
        return result === 'OK';
      } catch {
        // Fallback
      }
    }

    const now = Date.now();
    const existing = this.memoryCache.get(key);
    if (existing && existing.expiresAt > now) {
      return false;
    }

    this.memoryCache.set(key, {
      value,
      expiresAt: now + ttlSeconds * 1000,
    });
    return true;
  }

  private async setStorage(key: string, value: string, ttlSeconds: number): Promise<void> {
    if (this.redisClient && this.redisClient.status === 'ready') {
      try {
        await this.redisClient.set(key, value, 'EX', ttlSeconds);
        return;
      } catch {
        // Fallback
      }
    }

    this.memoryCache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  private async delStorage(key: string): Promise<void> {
    if (this.redisClient && this.redisClient.status === 'ready') {
      try {
        await this.redisClient.del(key);
        return;
      } catch {
        // Fallback
      }
    }

    this.memoryCache.delete(key);
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

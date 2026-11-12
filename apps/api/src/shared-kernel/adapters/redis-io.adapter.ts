import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter> | null = null;

  async connectToRedis(): Promise<void> {
    try {
      const pubClient = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        retryStrategy: () => null,
      });

      pubClient.on('error', (err) => {
        // Silencia para não lançar exceções não tratadas
        console.warn(`[RedisIoAdapter] Redis Pub indisponível: ${err.message}. Utilizando adapter de memória.`);
      });

      // Testa ping
      await Promise.race([
        pubClient.ping(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Redis timeout')), 1000)),
      ]);

      const subClient = pubClient.duplicate();
      subClient.on('error', (err) => {
        console.warn(`[RedisIoAdapter] Redis Sub indisponível: ${err.message}.`);
      });

      this.adapterConstructor = createAdapter(pubClient, subClient);
      console.log('[RedisIoAdapter] Conectado ao cluster Redis com sucesso.');
    } catch (err: any) {
      console.warn(`[RedisIoAdapter] Não foi possível conectar ao Redis (${err.message}). Operando em modo de memória local.`);
      this.adapterConstructor = null;
    }
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
    }
    return server;
  }
}

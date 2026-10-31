import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared-kernel/database/prisma.service';

export interface HealthCheckResult {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  uptime: number;
  environment: string;
  services: {
    database: 'up' | 'down';
    memory: {
      rssMb: number;
      heapUsedMb: number;
      heapTotalMb: number;
    };
  };
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly prisma: PrismaService) {}

  async check(): Promise<HealthCheckResult> {
    let dbStatus: 'up' | 'down' = 'down';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = 'up';
    } catch (err: any) {
      this.logger.error(`Healthcheck Database Ping Error: ${err?.message || err}`);
      dbStatus = 'down';
    }

    const mem = process.memoryUsage();
    const isOk = dbStatus === 'up';

    return {
      status: isOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: dbStatus,
        memory: {
          rssMb: Math.round(mem.rss / 1024 / 1024),
          heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
          heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
        },
      },
    };
  }

  async isReady(): Promise<{ ready: boolean; database: 'up' | 'down' }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { ready: true, database: 'up' };
    } catch {
      return { ready: false, database: 'down' };
    }
  }

  isLive(): { live: boolean; uptime: number } {
    return {
      live: true,
      uptime: Math.floor(process.uptime()),
    };
  }
}


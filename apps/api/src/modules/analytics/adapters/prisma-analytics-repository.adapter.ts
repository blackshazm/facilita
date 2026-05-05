import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared-kernel/database/prisma.service';
import { AnalyticsRepositoryPort } from '../ports/analytics-repository.port';

@Injectable()
export class PrismaAnalyticsRepository implements AnalyticsRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async upsertDailyMetric(date: Date, data: any): Promise<void> {
    const normalizedDate = new Date(date.toISOString().split('T')[0]);
    await this.prisma.dailyMetric.upsert({
      where: { date: normalizedDate },
      create: {
        date: normalizedDate,
        gmv: data.gmv || 0n,
        ordersCount: data.ordersCount || 0,
        matchesCount: data.matchesCount || 0,
        revenue: data.revenue || 0n,
      },
      update: {
        gmv: data.gmv ? { increment: data.gmv } : undefined,
        ordersCount: data.ordersCount ? { increment: data.ordersCount } : undefined,
        matchesCount: data.matchesCount ? { increment: data.matchesCount } : undefined,
        revenue: data.revenue ? { increment: data.revenue } : undefined,
      },
    });
  }

  async getDailyMetrics(startDate: Date, endDate: Date): Promise<any[]> {
    return this.prisma.dailyMetric.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });
  }
}

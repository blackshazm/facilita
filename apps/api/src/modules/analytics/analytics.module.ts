import { Module } from '@nestjs/common';
import { PrismaService } from '../../shared-kernel/database/prisma.service';
import { PrismaAnalyticsRepository } from './adapters/prisma-analytics-repository.adapter';
import { UpdateDailyMetricUseCase } from './application/use-cases/update-daily-metric.usecase';
import { GetDailyMetricsUseCase } from './application/use-cases/get-daily-metrics.usecase';
import { AnalyticsEventListener } from './adapters/analytics-event.listener';
import { AnalyticsController } from './adapters/analytics.controller';

@Module({
  controllers: [AnalyticsController],
  providers: [
    PrismaService,
    UpdateDailyMetricUseCase,
    GetDailyMetricsUseCase,
    AnalyticsEventListener,
    {
      provide: 'AnalyticsRepositoryPort',
      useClass: PrismaAnalyticsRepository,
    },
  ],
  exports: ['AnalyticsRepositoryPort'],
})
export class AnalyticsModule {}

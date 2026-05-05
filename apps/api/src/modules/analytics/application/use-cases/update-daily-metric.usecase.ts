import { Inject, Injectable } from '@nestjs/common';
import { AnalyticsRepositoryPort } from '../../ports/analytics-repository.port';

@Injectable()
export class UpdateDailyMetricUseCase {
  constructor(
    @Inject('AnalyticsRepositoryPort')
    private readonly analyticsRepository: AnalyticsRepositoryPort,
  ) {}

  async execute(data: { date?: Date; gmv?: bigint; ordersCount?: number; matchesCount?: number; revenue?: bigint }) {
    const date = data.date || new Date();
    await this.analyticsRepository.upsertDailyMetric(date, data);
  }
}

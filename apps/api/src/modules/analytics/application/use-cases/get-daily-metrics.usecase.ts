import { Inject, Injectable } from '@nestjs/common';
import { AnalyticsRepositoryPort } from '../../ports/analytics-repository.port';

@Injectable()
export class GetDailyMetricsUseCase {
  constructor(
    @Inject('AnalyticsRepositoryPort')
    private readonly analyticsRepository: AnalyticsRepositoryPort,
  ) {}

  async execute(days: number = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const metrics = await this.analyticsRepository.getDailyMetrics(startDate, endDate);
    
    // Serialize BigInt to string for JSON
    return metrics.map(m => ({
      ...m,
      gmv: m.gmv.toString(),
      revenue: m.revenue.toString(),
    }));
  }
}

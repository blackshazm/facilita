export interface AnalyticsRepositoryPort {
  upsertDailyMetric(date: Date, data: Partial<{ gmv: bigint; ordersCount: number; matchesCount: number; revenue: bigint }>): Promise<void>;
  getDailyMetrics(startDate: Date, endDate: Date): Promise<any[]>;
}

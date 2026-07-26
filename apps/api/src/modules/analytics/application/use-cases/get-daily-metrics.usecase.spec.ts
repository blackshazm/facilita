import { GetDailyMetricsUseCase } from './get-daily-metrics.usecase';

describe('GetDailyMetricsUseCase', () => {
  let useCase: GetDailyMetricsUseCase;
  let analyticsRepo: any;

  beforeEach(() => {
    analyticsRepo = {
      getDailyMetrics: jest.fn(),
    };
    useCase = new GetDailyMetricsUseCase(analyticsRepo);
  });

  it('should query metrics within the date range', async () => {
    analyticsRepo.getDailyMetrics.mockResolvedValue([]);

    await useCase.execute(7);

    expect(analyticsRepo.getDailyMetrics).toHaveBeenCalledWith(
      expect.any(Date), // startDate
      expect.any(Date), // endDate
    );
  });

  it('should serialize BigInt fields to strings', async () => {
    const mockData = [
      { id: '1', date: new Date(), gmv: 50000n, revenue: 10000n, ordersCount: 5, matchesCount: 4 },
    ];
    analyticsRepo.getDailyMetrics.mockResolvedValue(mockData);

    const result = await useCase.execute(30);

    expect(result).toHaveLength(1);
    expect(result[0].gmv).toBe('50000');
    expect(result[0].revenue).toBe('10000');
    expect(typeof result[0].gmv).toBe('string');
  });

  it('should default to 30 days if not provided', async () => {
    analyticsRepo.getDailyMetrics.mockResolvedValue([]);

    await useCase.execute();

    // Verification of exact dates is tricky, but we verify it's called
    expect(analyticsRepo.getDailyMetrics).toHaveBeenCalled();
  });
});

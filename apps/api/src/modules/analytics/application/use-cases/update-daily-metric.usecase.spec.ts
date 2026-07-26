import { UpdateDailyMetricUseCase } from './update-daily-metric.usecase';

describe('UpdateDailyMetricUseCase', () => {
  let useCase: UpdateDailyMetricUseCase;
  let analyticsRepo: any;

  beforeEach(() => {
    analyticsRepo = {
      upsertDailyMetric: jest.fn().mockResolvedValue(undefined),
    };
    useCase = new UpdateDailyMetricUseCase(analyticsRepo);
  });

  it('should call upsertDailyMetric with provided date and data', async () => {
    const date = new Date('2026-07-20');
    const data = { date, gmv: 10000n, ordersCount: 5, matchesCount: 3, revenue: 2000n };

    await useCase.execute(data);

    expect(analyticsRepo.upsertDailyMetric).toHaveBeenCalledWith(date, data);
  });

  it('should default to current date if not provided', async () => {
    const data = { gmv: 5000n };

    await useCase.execute(data);

    expect(analyticsRepo.upsertDailyMetric).toHaveBeenCalledWith(
      expect.any(Date),
      expect.objectContaining({ gmv: 5000n }),
    );
  });
});

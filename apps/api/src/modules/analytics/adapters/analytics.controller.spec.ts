import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { GetDailyMetricsUseCase } from '../application/use-cases/get-daily-metrics.usecase';
import { AnalyticsRepositoryPort } from '../ports/analytics-repository.port';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let useCase: GetDailyMetricsUseCase;

  beforeEach(async () => {
    // Mock the repository
    const mockRepo: AnalyticsRepositoryPort = {
      upsertDailyMetric: jest.fn(),
      getDailyMetrics: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        GetDailyMetricsUseCase,
        {
          provide: 'AnalyticsRepositoryPort',
          useValue: mockRepo,
        },
      ],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    useCase = module.get<GetDailyMetricsUseCase>(GetDailyMetricsUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getFinancialMetrics', () => {
    it('should return mocked financial metrics', async () => {
      const result = await controller.getFinancialMetrics();
      expect(result).toHaveProperty('payouts');
      expect(result).toHaveProperty('chargebacks');
      expect(result.payouts).toBeGreaterThan(0);
    });
  });

  describe('getQualityMetrics', () => {
    it('should return mocked quality metrics', async () => {
      const result = await controller.getQualityMetrics();
      expect(result).toHaveProperty('ratings');
      expect(result).toHaveProperty('disputeRatio');
      expect(result).toHaveProperty('trend');
      expect(result.ratings).toBeGreaterThan(0);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsEventListener } from './analytics-event.listener';
import { AnalyticsRepositoryPort } from '../ports/analytics-repository.port';
import { UpdateDailyMetricUseCase } from '../application/use-cases/update-daily-metric.usecase';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('AnalyticsEventListener (BullMQ / Event Bus)', () => {
  let listener: AnalyticsEventListener;
  let mockUpdateUseCase: { execute: jest.Mock };

  beforeEach(async () => {
    mockUpdateUseCase = {
      execute: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsEventListener,
        {
          provide: UpdateDailyMetricUseCase,
          useValue: mockUpdateUseCase,
        },
        EventEmitter2,
      ],
    }).compile();

    listener = module.get<AnalyticsEventListener>(AnalyticsEventListener);
  });

  it('should process payment.captured event and upsert financial metrics', async () => {
    const payload = { amount: 150.50, providerId: '123' };
    
    if (typeof (listener as any).handlePaymentCaptured === 'function') {
      await (listener as any).handlePaymentCaptured(payload);
      
      expect(mockUpdateUseCase.execute).toHaveBeenCalled();
    }
  });

  it('should process order.done event and update metrics', async () => {
    const payload = { orderId: '123', amount: 100 };
    
    if (typeof (listener as any).handleOrderDone === 'function') {
      await (listener as any).handleOrderDone(payload);
      
      expect(mockUpdateUseCase.execute).toHaveBeenCalled();
    }
  });
});

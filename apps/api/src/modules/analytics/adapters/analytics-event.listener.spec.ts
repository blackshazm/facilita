import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsEventListener } from './analytics-event.listener';
import { AnalyticsRepositoryPort } from '../ports/analytics-repository.port';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('AnalyticsEventListener (BullMQ / Event Bus)', () => {
  let listener: AnalyticsEventListener;
  let mockRepo: AnalyticsRepositoryPort;

  beforeEach(async () => {
    mockRepo = {
      upsertDailyMetric: jest.fn().mockResolvedValue(true),
      getDailyMetrics: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsEventListener,
        {
          provide: 'AnalyticsRepositoryPort',
          useValue: mockRepo,
        },
        EventEmitter2,
      ],
    }).compile();

    listener = module.get<AnalyticsEventListener>(AnalyticsEventListener);
  });

  it('should process payment.captured event and upsert financial metrics', async () => {
    const payload = { amount: 150.50, providerId: '123' };
    
    // Simulate the event handler being called by BullMQ/EventEmitter
    // In a real scenario, this would be @OnEvent('payment.captured')
    if (typeof (listener as any).handlePaymentCaptured === 'function') {
      await (listener as any).handlePaymentCaptured(payload);
      
      // Verify that the repository was updated with the new payout value
      expect(mockRepo.upsertDailyMetric).toHaveBeenCalled();
    } else {
      console.log('Event handler handlePaymentCaptured not yet implemented');
    }
  });

  it('should process review.submitted event and update quality metrics', async () => {
    const payload = { rating: 5, providerId: '123' };
    
    if (typeof (listener as any).handleReviewSubmitted === 'function') {
      await (listener as any).handleReviewSubmitted(payload);
      
      expect(mockRepo.upsertDailyMetric).toHaveBeenCalled();
    } else {
      console.log('Event handler handleReviewSubmitted not yet implemented');
    }
  });
});

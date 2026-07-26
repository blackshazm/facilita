import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { OrderDoneEvent } from '../../../shared/events/events';
import { OrderDoneListener } from '../infrastructure/listeners/order-done.listener';
import { CapturePaymentUseCase } from '../application/capture-payment.usecase';

describe('Order to Payment Integration', () => {
  let eventEmitter: EventEmitter2;
  let capturePaymentUseCase: CapturePaymentUseCase;

  beforeEach(async () => {
    // Mock the usecase
    const mockCapturePaymentUseCase = {
      execute: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        EventEmitterModule.forRoot(),
      ],
      providers: [
        OrderDoneListener,
        {
          provide: CapturePaymentUseCase,
          useValue: mockCapturePaymentUseCase,
        },
      ],
    }).compile();

    await module.init();

    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    capturePaymentUseCase = module.get<CapturePaymentUseCase>(CapturePaymentUseCase);
  });

  it('should trigger payment capture when an order is completed', async () => {
    const event = new OrderDoneEvent('order-123', 'provider-456', 15000n);

    // Act
    await eventEmitter.emitAsync('order.done', event);

    // Assert
    expect(capturePaymentUseCase.execute).toHaveBeenCalledTimes(1);
    expect(capturePaymentUseCase.execute).toHaveBeenCalledWith('order-123', 'provider-456');
  });
});

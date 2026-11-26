import { Test, TestingModule } from '@nestjs/testing';
import { OrderDoneListener } from './order-done.listener';
import { CapturePaymentUseCase } from '../../application/capture-payment.usecase';

describe('OrderDoneListener', () => {
  let provider: OrderDoneListener;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderDoneListener,
        { provide: CapturePaymentUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    provider = module.get<OrderDoneListener>(OrderDoneListener);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

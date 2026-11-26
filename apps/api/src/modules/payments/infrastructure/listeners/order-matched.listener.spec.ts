import { Test, TestingModule } from '@nestjs/testing';
import { OrderMatchedListener } from './order-matched.listener';
import { AuthorizePaymentUseCase } from '../../application/authorize-payment.usecase';
import { ORDER_REPOSITORY_PORT } from '../../../orders/ports/order-repository.port';

describe('OrderMatchedListener', () => {
  let provider: OrderMatchedListener;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderMatchedListener,
        { provide: AuthorizePaymentUseCase, useValue: { execute: jest.fn() } },
        { provide: ORDER_REPOSITORY_PORT, useValue: { findById: jest.fn() } },
      ],
    }).compile();

    provider = module.get<OrderMatchedListener>(OrderMatchedListener);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

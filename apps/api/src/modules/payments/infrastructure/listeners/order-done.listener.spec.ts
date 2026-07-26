import { Test, TestingModule } from '@nestjs/testing';
import { OrderDoneListener } from './order-done.listener';

describe('OrderDoneListener', () => {
  let provider: OrderDoneListener;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderDoneListener,
        // TODO: Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<OrderDoneListener>(OrderDoneListener);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { OrderMatchedListener } from './order-matched.listener';

describe('OrderMatchedListener', () => {
  let provider: OrderMatchedListener;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderMatchedListener,
        // TODO: Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<OrderMatchedListener>(OrderMatchedListener);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

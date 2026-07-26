import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';

describe('OrderController', () => {
  let provider: OrderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderController,
        // TODO: Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<OrderController>(OrderController);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

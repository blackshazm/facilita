import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from '../application/order.service';
import { CHAT_SERVICE_PORT } from '../ports/chat-service.port';

describe('OrderController', () => {
  let provider: OrderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderController,
        { provide: OrderService, useValue: { createOrder: jest.fn(), checkIn: jest.fn() } },
        { provide: CHAT_SERVICE_PORT, useValue: { generateUserToken: jest.fn() } },
      ],
    }).compile();

    provider = module.get<OrderController>(OrderController);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

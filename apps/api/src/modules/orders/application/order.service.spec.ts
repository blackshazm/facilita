import { OrderService } from './order.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Order, OrderStatus } from '../core/order.entity';

describe('OrderService', () => {
  let service: OrderService;
  let orderRepo: any;

  beforeEach(() => {
    orderRepo = {
      findById: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
      findByUserId: jest.fn(),
      calculateDistance: jest.fn(),
    };

    service = new OrderService(orderRepo);
  });

  describe('checkIn()', () => {
    const mockOrder = new Order({
      id: 'order-1',
      userId: 'user-1',
      providerId: 'provider-1',
      status: OrderStatus.EN_ROUTE,
      totalAmount: 12000,
      latitude: -23.55,
      longitude: -46.63,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    it('should allow check-in when distance < 500m', async () => {
      orderRepo.findById.mockResolvedValue(mockOrder);
      orderRepo.calculateDistance.mockResolvedValue(200); // 200 meters

      await service.checkIn('order-1', -23.55, -46.63);

      expect(orderRepo.save).toHaveBeenCalled();
      expect(mockOrder.status).toBe(OrderStatus.ARRIVED);
    });

    it('should deny check-in when distance > 500m', async () => {
      const order = new Order({
        id: 'order-2',
        userId: 'user-1',
        providerId: 'provider-1',
        status: OrderStatus.EN_ROUTE,
        totalAmount: 12000,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      orderRepo.findById.mockResolvedValue(order);
      orderRepo.calculateDistance.mockResolvedValue(800); // 800 meters

      await expect(
        service.checkIn('order-2', -23.60, -46.70),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException for non-existent order', async () => {
      orderRepo.findById.mockResolvedValue(null);

      await expect(
        service.checkIn('order-invalid', -23.55, -46.63),
      ).rejects.toThrow(NotFoundException);
    });

    it('should allow check-in at exactly 500m', async () => {
      const order = new Order({
        id: 'order-3',
        userId: 'user-1',
        providerId: 'provider-1',
        status: OrderStatus.EN_ROUTE,
        totalAmount: 12000,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      orderRepo.findById.mockResolvedValue(order);
      orderRepo.calculateDistance.mockResolvedValue(500);

      await service.checkIn('order-3', -23.55, -46.63);
      expect(orderRepo.save).toHaveBeenCalled();
    });
  });
});

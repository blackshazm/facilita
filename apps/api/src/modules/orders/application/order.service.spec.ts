import { OrderService } from './order.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Order, OrderStatus } from '../core/order.entity';

describe('OrderService', () => {
  let service: OrderService;
  let orderRepo: any;
  let mockPrisma: any;

  beforeEach(() => {
    orderRepo = {
      findById: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
      findByUserId: jest.fn(),
      calculateDistance: jest.fn(),
    };

    mockPrisma = {
      order: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      evidence: {
        count: jest.fn(),
        create: jest.fn(),
      },
    };
    const mockEventEmitter = { emit: jest.fn() } as any;

    service = new OrderService(orderRepo, mockPrisma, mockEventEmitter);
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

  describe('listOrders()', () => {
    it('should return paginated orders with nextCursor when hasMore is true', async () => {
      const mockOrders = [
        { id: 'ord-1', userId: 'user-1', providerId: 'prov-1', status: 'DONE', totalAmount: 120, createdAt: new Date(), updatedAt: new Date() },
        { id: 'ord-2', userId: 'user-1', providerId: 'prov-1', status: 'DONE', totalAmount: 150, createdAt: new Date(), updatedAt: new Date() },
        { id: 'ord-3', userId: 'user-1', providerId: 'prov-2', status: 'PENDING', totalAmount: 90, createdAt: new Date(), updatedAt: new Date() },
      ];

      // Limit 2 with 3 items returned indicates hasMore
      mockPrisma.order.findMany.mockResolvedValue(mockOrders);
      mockPrisma.order.count.mockResolvedValue(5);

      const result = await service.listOrders('user-1', 'CUSTOMER', { limit: 2 });

      expect(result.data.length).toBe(2);
      expect(result.hasMore).toBe(true);
      expect(result.nextCursor).toBe('ord-2');
      expect(result.totalCount).toBe(5);
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(expect.objectContaining({
        take: 3,
        where: { userId: 'user-1' },
      }));
    });

    it('should apply status filter if provided', async () => {
      mockPrisma.order.findMany.mockResolvedValue([]);
      mockPrisma.order.count.mockResolvedValue(0);

      const result = await service.listOrders('user-1', 'CUSTOMER', { status: 'DONE' });

      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { userId: 'user-1', status: 'DONE' },
      }));
      expect(result.hasMore).toBe(false);
      expect(result.nextCursor).toBeNull();
    });
  });

  describe('getOrderReceipt()', () => {
    const fixedDate = new Date('2026-10-15T12:00:00Z');
    const mockOrder = {
      id: 'ord-test-receipt-12345',
      userId: 'user-cust-1',
      providerId: 'user-prov-1',
      status: 'DONE',
      totalAmount: 200.0,
      createdAt: fixedDate,
      updatedAt: fixedDate,
    };

    it('should calculate financial breakdown and return receipt with 90-day warranty', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);

      const receipt = await service.getOrderReceipt('ord-test-receipt-12345', 'user-cust-1', 'CUSTOMER');

      expect(receipt.receiptNumber).toBe('REC-ORD-TEST');
      expect(receipt.breakdown.serviceGrossAmount).toBe(200);
      expect(receipt.breakdown.platformFee).toBe(30); // 15%
      expect(receipt.breakdown.providerNetAmount).toBe(170); // 85%
      expect(receipt.breakdown.taxRetention).toBe(10); // 5%
      expect(receipt.breakdown.totalPaid).toBe(200);
      expect(receipt.warranty.periodDays).toBe(90);
      expect(receipt.securityHash).toBeDefined();
      expect(receipt.securityHash.length).toBe(64); // SHA256 length
    });

    it('should throw NotFoundException when order does not exist', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);

      await expect(
        service.getOrderReceipt('non-existent', 'user-cust-1', 'CUSTOMER'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is neither customer nor provider nor admin', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);

      await expect(
        service.getOrderReceipt('ord-test-receipt-12345', 'user-stranger', 'CUSTOMER'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow ADMIN to retrieve receipt of any order', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);

      const receipt = await service.getOrderReceipt('ord-test-receipt-12345', 'admin-user', 'ADMIN');
      expect(receipt).toBeDefined();
      expect(receipt.orderId).toBe('ord-test-receipt-12345');
    });
  });
});

import { OrderService } from './order.service';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Order, OrderStatus } from '../core/order.entity';

describe('OrderService', () => {
  let service: OrderService;
  let orderRepo: any;
  let mockPrisma: any;
  let mockEventEmitter: any;

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
        create: jest.fn().mockImplementation((args: any) => ({
          id: 'evid-mock-1',
          ...args.data,
        })),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
    };
    mockEventEmitter = { emit: jest.fn() };

    service = new OrderService(orderRepo, mockPrisma, mockEventEmitter);
  });

  describe('createOrder()', () => {
    it('should add canonical fixed urgency fee of R$ 40.00 when urgency is urgent', async () => {
      mockPrisma.order.create.mockImplementation((args: any) => ({
        id: 'ord-urg-1',
        ...args.data,
      }));

      const order = await service.createOrder({
        userId: 'user-1',
        totalAmount: 100.0,
        urgency: 'urgent',
      });

      // Canônico v4.1 (#36): R$ 100 base + R$ 40 taxa fixa de urgência = R$ 140
      expect(order.totalAmount).toBe(140.0);
      expect(mockPrisma.order.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          totalAmount: 140.0,
        }),
      }));
    });

    it('should keep base price when urgency is normal', async () => {
      mockPrisma.order.create.mockImplementation((args: any) => ({
        id: 'ord-norm-1',
        ...args.data,
      }));

      const order = await service.createOrder({
        userId: 'user-1',
        totalAmount: 100.0,
        urgency: 'normal',
      });

      expect(order.totalAmount).toBe(100.0);
    });
  });

  describe('startOrder()', () => {
    it('should throw BadRequestException if no BEFORE evidence exists for the order', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'ord-start-1',
        status: 'ARRIVED',
        userId: 'user-1',
      });
      mockPrisma.evidence.count.mockResolvedValue(0);

      await expect(
        service.startOrder('ord-start-1', 'prov-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow startOrder when at least 1 BEFORE evidence is registered', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'ord-start-1',
        status: 'ARRIVED',
        userId: 'user-1',
      });
      mockPrisma.evidence.count.mockResolvedValue(1);
      mockPrisma.order.update.mockResolvedValue({
        id: 'ord-start-1',
        status: 'IN_PROGRESS',
      });

      const updated = await service.startOrder('ord-start-1', 'prov-1');
      expect(updated.status).toBe('IN_PROGRESS');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('order.started', {
        orderId: 'ord-start-1',
        providerId: 'prov-1',
      });
    });
  });

  describe('getOrderById()', () => {
    const mockOrderDetails = {
      id: 'ord-detail-1',
      userId: 'cust-123',
      providerId: 'prov-456',
      status: 'MATCHED',
      totalAmount: 150.0,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: 'cust-123',
        name: 'Maria Oliveira',
        phone: '11987654321',
      },
    };

    it('should mask customer phone for PROVIDER and include call proxy flag', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(mockOrderDetails);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'cust-123',
        name: 'Maria Oliveira',
        phone: '11987654321',
      });

      const order = await service.getOrderById('ord-detail-1', 'prov-456', 'PROVIDER');

      expect(order.id).toBe('ord-detail-1');
      expect(order.customer.phone).toBe('(11) 9****-4321');
      expect(order.callProxyAvailable).toBe(true);
      expect(order.chatChannelId).toBe('order-ord-detail-1');
    });

    it('should return unmasked customer phone for CUSTOMER owner or ADMIN', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(mockOrderDetails);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'cust-123',
        name: 'Maria Oliveira',
        phone: '11987654321',
      });

      const customerView = await service.getOrderById('ord-detail-1', 'cust-123', 'CUSTOMER');
      expect(customerView.customer.phone).toBe('11987654321');

      const adminView = await service.getOrderById('ord-detail-1', 'admin-999', 'ADMIN');
      expect(adminView.customer.phone).toBe('11987654321');
    });

    it('should throw ForbiddenException if user is not customer, provider or admin', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(mockOrderDetails);

      await expect(
        service.getOrderById('ord-detail-1', 'stranger-000', 'CUSTOMER'),
      ).rejects.toThrow(ForbiddenException);
    });
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
      expect(receipt.breakdown.platformFee).toBe(40); // 20% canônico v4.1
      expect(receipt.breakdown.providerNetAmount).toBe(160); // 80%
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

  describe('cancelOrder()', () => {
    it('should cancel with 100% refund when canceled within 5 minutes', async () => {
      const fixedTime = new Date('2026-11-01T10:00:00Z');
      const cancelTime = new Date('2026-11-01T10:02:00Z');
      const mockOrder = {
        id: 'ord-cancel-1',
        userId: 'user-cust-1',
        providerId: 'user-prov-1',
        status: 'MATCHED',
        totalAmount: 140.0,
        createdAt: fixedTime,
        updatedAt: fixedTime,
      };
      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);
      mockPrisma.order.update.mockResolvedValue({ ...mockOrder, status: 'CANCELED' });

      const result = await service.cancelOrder('ord-cancel-1', 'user-cust-1', 'Mudança de planos', cancelTime);

      expect(result.status).toBe('CANCELED');
      expect(result.displacementFee).toBe(0);
      expect(result.refundAmount).toBe(140.0);
      expect(result.isWithinFreeGracePeriod).toBe(true);
      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: 'ord-cancel-1' },
        data: { status: 'CANCELED', updatedAt: cancelTime },
      });
    });

    it('should retain displacement fee of R$ 35 when canceling after 5 minutes', async () => {
      const fixedTime = new Date('2026-11-01T10:00:00Z');
      const cancelTime = new Date('2026-11-01T10:10:00Z'); // 10 min
      const mockOrder = {
        id: 'ord-cancel-2',
        userId: 'user-cust-1',
        providerId: 'user-prov-1',
        status: 'EN_ROUTE',
        totalAmount: 140.0,
        createdAt: fixedTime,
        updatedAt: fixedTime,
      };
      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);
      mockPrisma.order.update.mockResolvedValue({ ...mockOrder, status: 'CANCELED' });

      const result = await service.cancelOrder('ord-cancel-2', 'user-cust-1', 'Demora', cancelTime);

      expect(result.status).toBe('CANCELED');
      expect(result.displacementFee).toBe(35.0);
      expect(result.refundAmount).toBe(105.0);
      expect(result.isWithinFreeGracePeriod).toBe(false);
    });

    it('should throw ForbiddenException if canceling user is not titular customer or provider', async () => {
      const mockOrder = {
        id: 'ord-cancel-3',
        userId: 'user-cust-1',
        providerId: 'user-prov-1',
        status: 'MATCHED',
        totalAmount: 140.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);

      await expect(
        service.cancelOrder('ord-cancel-3', 'user-hacker', 'Tentativa não autorizada'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('requestAdditional()', () => {
    const mockOrder = {
      id: 'ord-add-1',
      userId: 'user-cust-1',
      providerId: 'prov-1',
      status: 'IN_PROGRESS',
      totalAmount: 100.0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should auto-approve additionals <= R$ 30 and <= order total', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);
      mockPrisma.evidence.count.mockResolvedValue(0);

      const result = await service.requestAdditional('ord-add-1', 'prov-1', {
        amount: 25.0,
        description: 'Fita isolante e conectores',
      });

      expect(result.status).toBe('APPROVED');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'order.additional_requested',
        expect.objectContaining({
          orderId: 'ord-add-1',
          amount: 25.0,
          autoApproved: true,
        }),
      );
    });

    it('should set status PENDING_CUSTOMER_APPROVAL for additionals > R$ 30 and <= order total', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);
      mockPrisma.evidence.count.mockResolvedValue(0);

      const result = await service.requestAdditional('ord-add-1', 'prov-1', {
        amount: 80.0,
        description: 'Disjuntor bipolar 40A',
      });

      expect(result.status).toBe('PENDING_CUSTOMER_APPROVAL');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'order.additional_requested',
        expect.objectContaining({
          orderId: 'ord-add-1',
          amount: 80.0,
          autoApproved: false,
        }),
      );
    });

    it('should trigger PENDING_ADMIN_AUDIT when additional is > 100% of order total (v4.1 anti-extortion lock)', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(mockOrder); // totalAmount = 100.0
      mockPrisma.evidence.count.mockResolvedValue(0);

      const result = await service.requestAdditional('ord-add-1', 'prov-1', {
        amount: 150.0, // > 100.0
        description: 'Troca de fiação completa não orçada',
      });

      expect(result.status).toBe('PENDING_ADMIN_AUDIT');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'order.additional_audit_required',
        expect.objectContaining({
          orderId: 'ord-add-1',
          providerId: 'prov-1',
          orderAmount: 100.0,
          additionalAmount: 150.0,
          description: 'Troca de fiação completa não orçada',
        }),
      );
    });

    it('should reject if order already reached max 3 additionals', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);
      mockPrisma.evidence.count.mockResolvedValue(3);

      await expect(
        service.requestAdditional('ord-add-1', 'prov-1', {
          amount: 20.0,
          description: 'Quarto adicional',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('respondAdditional()', () => {
    const mockOrder = {
      id: 'ord-add-2',
      userId: 'user-cust-1',
      providerId: 'prov-1',
      status: 'IN_PROGRESS',
      totalAmount: 140.0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockEvidence = {
      id: 'evid-add-1',
      orderId: 'ord-add-2',
      providerId: 'prov-1',
      url: 'https://exemplo.com/material.png',
      type: 'DISPUTE',
      metadata: {
        amount: 60.0,
        description: 'Válvula de descarga Hydra',
        status: 'PENDING_CUSTOMER_APPROVAL',
      },
      createdAt: new Date(),
    };

    it('should approve additional, increment order totalAmount, and emit event', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);
      mockPrisma.evidence.findUnique.mockResolvedValue(mockEvidence);
      mockPrisma.evidence.update.mockResolvedValue({
        ...mockEvidence,
        metadata: { ...mockEvidence.metadata, status: 'APPROVED' },
      });
      mockPrisma.order.update.mockResolvedValue({
        ...mockOrder,
        totalAmount: 200.0,
      });

      const result = await service.respondAdditional('ord-add-2', 'evid-add-1', 'user-cust-1', 'APPROVED');

      expect(result.status).toBe('APPROVED');
      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: 'ord-add-2' },
        data: { totalAmount: 200.0 },
      });
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'order.additional_responded',
        expect.objectContaining({
          orderId: 'ord-add-2',
          additionalId: 'evid-add-1',
          userId: 'user-cust-1',
          decision: 'APPROVED',
        }),
      );
    });

    it('should reject additional without updating order totalAmount', async () => {
      const freshEvidence = {
        ...mockEvidence,
        metadata: { ...mockEvidence.metadata, status: 'PENDING_CUSTOMER_APPROVAL' },
      };
      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);
      mockPrisma.evidence.findUnique.mockResolvedValue(freshEvidence);
      mockPrisma.evidence.update.mockResolvedValue({
        ...freshEvidence,
        metadata: { ...freshEvidence.metadata, status: 'REJECTED' },
      });

      const result = await service.respondAdditional('ord-add-2', 'evid-add-1', 'user-cust-1', 'REJECTED');

      expect(result.status).toBe('REJECTED');
      expect(mockPrisma.order.update).not.toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'order.additional_responded',
        expect.objectContaining({
          orderId: 'ord-add-2',
          additionalId: 'evid-add-1',
          userId: 'user-cust-1',
          decision: 'REJECTED',
        }),
      );
    });

    it('should throw ForbiddenException if user is not the order customer', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);

      await expect(
        service.respondAdditional('ord-add-2', 'evid-add-1', 'intruder-user', 'APPROVED'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});

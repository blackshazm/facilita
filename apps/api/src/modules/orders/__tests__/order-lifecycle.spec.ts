import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { OrderService } from '../application/order.service';
import { ORDER_REPOSITORY_PORT } from '../ports/order-repository.port';
import { PrismaService } from '../../../shared-kernel/database/prisma.service';
import { BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';

describe('OrderService — Lifecycle & Rules', () => {
  let service: OrderService;
  let eventEmitter: EventEmitter2;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      order: {
        create: jest.fn().mockImplementation(({ data }) =>
          Promise.resolve({ id: 'ord-123', status: 'PENDING', ...data }),
        ),
        findUnique: jest.fn().mockImplementation(({ where }) =>
          Promise.resolve({
            id: where.id,
            userId: 'cust-1',
            providerId: null,
            status: 'PENDING',
            totalAmount: 100.0,
            version: 1,
          }),
        ),
        update: jest.fn().mockImplementation(({ where, data }) =>
          Promise.resolve({ id: where.id, ...data }),
        ),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      evidence: {
        create: jest.fn().mockResolvedValue({}),
        count: jest.fn().mockResolvedValue(1),
      },
      dispute: {
        create: jest.fn().mockResolvedValue({ id: 'disp-1' }),
      },
    };

    const mockRepo = {
      findById: jest.fn(),
      save: jest.fn(),
      calculateDistance: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot()],
      providers: [
        OrderService,
        { provide: PrismaService, useValue: prisma },
        { provide: ORDER_REPOSITORY_PORT, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  describe('createOrder', () => {
    it('deve criar pedido normal com valor base', async () => {
      const result = await service.createOrder({
        userId: 'cust-1',
        totalAmount: 100.0,
        urgency: 'normal',
      });

      expect(result.totalAmount).toBe(100.0);
      expect(prisma.order.create).toHaveBeenCalled();
    });

    it('deve aplicar taxa fixa de urgência de R$ 40 em pedidos urgentes (v4.1 #36)', async () => {
      const result = await service.createOrder({
        userId: 'cust-1',
        totalAmount: 100.0,
        urgency: 'urgent',
      });

      expect(result.totalAmount).toBe(140.0);
    });
  });

  describe('acceptOrder', () => {
    it('deve alterar status para MATCHED e disparar evento order.accepted', async () => {
      const emitSpy = jest.spyOn(eventEmitter, 'emit');

      // Configura o retorno para as duas chamadas de findUnique em acceptOrder
      prisma.order.findUnique
        .mockResolvedValueOnce({
          id: 'ord-123',
          userId: 'cust-1',
          providerId: null,
          status: 'PENDING',
          totalAmount: 100.0,
          version: 1,
        })
        .mockResolvedValueOnce({
          id: 'ord-123',
          userId: 'cust-1',
          providerId: 'prov-1',
          status: 'MATCHED',
          totalAmount: 100.0,
          version: 2,
        });

      const result = await service.acceptOrder('ord-123', 'prov-1');

      expect(result.status).toBe('MATCHED');
      expect(emitSpy).toHaveBeenCalledWith(
        'order.accepted',
        expect.objectContaining({
          orderId: 'ord-123',
          customerId: 'cust-1',
          providerId: 'prov-1',
        }),
      );
    });

    it('deve lançar ConflictException se o pedido já foi aceito em paralelo (Optimistic Locking)', async () => {
      prisma.order.updateMany.mockResolvedValueOnce({ count: 0 });

      await expect(service.acceptOrder('ord-123', 'prov-2')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('requestAdditional', () => {
    it('deve auto-aprovar adicionais de até R$ 30,00', async () => {
      const result = await service.requestAdditional('ord-123', 'prov-1', {
        description: 'Fita isolante',
        amount: 25.0,
      });

      expect(result.status).toBe('APPROVED');
    });

    it('deve solicitar aprovação do cliente para adicionais > R$ 30,00', async () => {
      const result = await service.requestAdditional('ord-123', 'prov-1', {
        description: 'Disjuntor 30A',
        amount: 65.0,
      });

      expect(result.status).toBe('PENDING_CUSTOMER_APPROVAL');
    });

    it('deve rejeitar se atingir o limite de 3 adicionais', async () => {
      prisma.evidence.count.mockResolvedValueOnce(3);

      await expect(
        service.requestAdditional('ord-123', 'prov-1', {
          description: 'Cabo flexível',
          amount: 40.0,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('claimWarranty', () => {
    it('deve abrir contestação com tag GARANTIA_90_DIAS', async () => {
      const result = await service.claimWarranty('ord-123', 'cust-1', 'Chuveiro voltou a vazar');

      expect(result.success).toBe(true);
      expect(prisma.dispute.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            reason: expect.stringContaining('GARANTIA_90_DIAS'),
          }),
        }),
      );
    });
  });
});

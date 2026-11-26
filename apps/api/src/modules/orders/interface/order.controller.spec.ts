import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from '../application/order.service';
import { CHAT_SERVICE_PORT } from '../ports/chat-service.port';

describe('OrderController', () => {
  let controller: OrderController;
  let orderService: any;

  beforeEach(async () => {
    orderService = {
      createOrder: jest.fn(),
      checkIn: jest.fn(),
      listOrders: jest.fn().mockResolvedValue({ data: [], nextCursor: null, hasMore: false, totalCount: 0 }),
      getOrderReceipt: jest.fn().mockResolvedValue({ receiptNumber: 'REC-123' }),
      getOrderById: jest.fn().mockResolvedValue({ id: 'ord-1', customer: { phone: '(11) 9****-1234' } }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderController,
        { provide: OrderService, useValue: orderService },
        { provide: CHAT_SERVICE_PORT, useValue: { generateUserToken: jest.fn() } },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call orderService.listOrders with query params and user context', async () => {
    const req = { user: { id: 'user-1', role: 'CUSTOMER' } };
    await controller.listOrders(req, 'cursor-1', 15, 'DONE');

    expect(orderService.listOrders).toHaveBeenCalledWith('user-1', 'CUSTOMER', {
      cursor: 'cursor-1',
      limit: 15,
      status: 'DONE',
    });
  });

  it('should call orderService.getOrderById with orderId and user context', async () => {
    const req = { user: { id: 'prov-1', role: 'PROVIDER' } };
    const order = await controller.getOrderById('ord-1', req);

    expect(orderService.getOrderById).toHaveBeenCalledWith('ord-1', 'prov-1', 'PROVIDER');
    expect(order.customer.phone).toBe('(11) 9****-1234');
  });

  it('should call orderService.getOrderReceipt with orderId and user context', async () => {
    const req = { user: { id: 'user-1', role: 'CUSTOMER' } };
    const receipt = await controller.getReceipt('ord-1', req);

    expect(orderService.getOrderReceipt).toHaveBeenCalledWith('ord-1', 'user-1', 'CUSTOMER');
    expect(receipt).toEqual({ receiptNumber: 'REC-123' });
  });

  it('should call orderService.cancelOrder with reason and user context', async () => {
    orderService.cancelOrder = jest.fn().mockResolvedValue({ status: 'CANCELED', refundAmount: 140 });
    const req = { user: { id: 'user-1', role: 'CUSTOMER' } };
    const result = await controller.cancelOrder('ord-1', req, { reason: 'Demorou muito' });

    expect(orderService.cancelOrder).toHaveBeenCalledWith('ord-1', 'user-1', 'Demorou muito');
    expect(result.status).toBe('CANCELED');
  });

  it('should call orderService.respondAdditional when customer approves or rejects additional', async () => {
    orderService.respondAdditional = jest.fn().mockResolvedValue({
      orderId: 'ord-1',
      additionalId: 'add-123',
      status: 'APPROVED',
      message: 'Adicional aprovado com sucesso',
    });
    const req = { user: { id: 'user-1', role: 'CUSTOMER' } };
    const result = await controller.respondAdditional('ord-1', 'add-123', req, { status: 'APPROVED' });

    expect(orderService.respondAdditional).toHaveBeenCalledWith('ord-1', 'add-123', 'user-1', 'APPROVED');
    expect(result.status).toBe('APPROVED');
  });
});

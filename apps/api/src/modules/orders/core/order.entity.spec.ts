import { Order, OrderStatus } from './order.entity';

describe('Order Entity', () => {
  const makeOrder = (overrides?: Partial<{
    status: OrderStatus;
    latitude: number;
    longitude: number;
    providerId: string;
  }>): Order => {
    return new Order({
      id: 'order-1',
      userId: 'user-1',
      providerId: overrides?.providerId,
      status: overrides?.status ?? OrderStatus.PENDING,
      totalAmount: 12000,
      latitude: overrides?.latitude,
      longitude: overrides?.longitude,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    });
  };

  describe('assignProvider()', () => {
    it('should set providerId and change status to MATCHED', () => {
      const order = makeOrder();
      order.assignProvider('provider-1');
      const json = order.toJSON();
      expect(json.providerId).toBe('provider-1');
      expect(order.status).toBe(OrderStatus.MATCHED);
    });

    it('should update the updatedAt timestamp', () => {
      const order = makeOrder();
      const before = new Date();
      order.assignProvider('provider-1');
      const json = order.toJSON();
      expect(json.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });

  describe('updateStatus()', () => {
    it('should change the status', () => {
      const order = makeOrder({ status: OrderStatus.MATCHED });
      order.updateStatus(OrderStatus.EN_ROUTE);
      expect(order.status).toBe(OrderStatus.EN_ROUTE);
    });

    it('should update the updatedAt timestamp', () => {
      const order = makeOrder();
      const before = new Date();
      order.updateStatus(OrderStatus.DONE);
      const json = order.toJSON();
      expect(json.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });

  describe('location getter', () => {
    it('should return lat/lng when both are present', () => {
      const order = makeOrder({ latitude: -23.55, longitude: -46.63 });
      expect(order.location).toEqual({ lat: -23.55, lng: -46.63 });
    });

    it('should return undefined when latitude is missing', () => {
      const order = makeOrder({ longitude: -46.63 });
      expect(order.location).toBeUndefined();
    });

    it('should return undefined when longitude is missing', () => {
      const order = makeOrder({ latitude: -23.55 });
      expect(order.location).toBeUndefined();
    });

    it('should return undefined when both are missing', () => {
      const order = makeOrder();
      expect(order.location).toBeUndefined();
    });
  });

  describe('cancel()', () => {
    it('should allow free cancellation if status is PENDING', () => {
      const order = makeOrder({ status: OrderStatus.PENDING });
      const result = order.cancel('Cliente desistiu antes do aceite');

      expect(order.status).toBe(OrderStatus.CANCELED);
      expect(result.displacementFee).toBe(0);
      expect(result.refundAmount).toBe(12000);
      expect(result.isWithinFreeGracePeriod).toBe(true);
    });

    it('should allow free cancellation within 5 minutes of matching', () => {
      const matchedAt = new Date('2026-11-01T10:00:00Z');
      const cancelAt = new Date('2026-11-01T10:03:00Z'); // 3 minutes later (< 5 min)
      const order = new Order({
        id: 'ord-1',
        userId: 'user-1',
        providerId: 'prov-1',
        status: OrderStatus.MATCHED,
        totalAmount: 120,
        createdAt: matchedAt,
        updatedAt: matchedAt,
      });

      const result = order.cancel('Mudança de planos', cancelAt);

      expect(order.status).toBe(OrderStatus.CANCELED);
      expect(result.displacementFee).toBe(0);
      expect(result.refundAmount).toBe(120);
      expect(result.isWithinFreeGracePeriod).toBe(true);
    });

    it('should retain displacement fee of R$ 35 when canceling after 5 minutes of dispatch', () => {
      const matchedAt = new Date('2026-11-01T10:00:00Z');
      const cancelAt = new Date('2026-11-01T10:08:00Z'); // 8 minutes later (> 5 min)
      const order = new Order({
        id: 'ord-1',
        userId: 'user-1',
        providerId: 'prov-1',
        status: OrderStatus.EN_ROUTE,
        totalAmount: 140,
        createdAt: matchedAt,
        updatedAt: matchedAt,
      });

      const result = order.cancel('Demora do prestador', cancelAt);

      expect(order.status).toBe(OrderStatus.CANCELED);
      expect(result.displacementFee).toBe(35);
      expect(result.refundAmount).toBe(105); // 140 - 35 = 105
      expect(result.isWithinFreeGracePeriod).toBe(false);
    });

    it('should retain displacement fee if provider has ARRIVED regardless of time', () => {
      const arrivedAt = new Date('2026-11-01T10:00:00Z');
      const cancelAt = new Date('2026-11-01T10:02:00Z');
      const order = new Order({
        id: 'ord-1',
        userId: 'user-1',
        providerId: 'prov-1',
        status: OrderStatus.ARRIVED,
        totalAmount: 100,
        createdAt: arrivedAt,
        updatedAt: arrivedAt,
      });

      const result = order.cancel('Cliente precisou sair', cancelAt);

      expect(order.status).toBe(OrderStatus.CANCELED);
      expect(result.displacementFee).toBe(35);
      expect(result.refundAmount).toBe(65);
      expect(result.isWithinFreeGracePeriod).toBe(false);
    });

    it('should throw an error when attempting to cancel an already completed order', () => {
      const order = makeOrder({ status: OrderStatus.DONE });
      expect(() => order.cancel('Tarde demais')).toThrow('Não é possível cancelar uma ordem de serviço já concluída');
    });

    it('should throw an error when attempting to cancel an already canceled order', () => {
      const order = makeOrder({ status: OrderStatus.CANCELED });
      expect(() => order.cancel('Cancelando novamente')).toThrow('Esta ordem de serviço já se encontra cancelada');
    });
  });

  describe('toJSON()', () => {
    it('should return a complete snapshot of order properties', () => {
      const order = makeOrder({ latitude: -23.55, longitude: -46.63 });
      const json = order.toJSON();
      expect(json).toEqual(expect.objectContaining({
        id: 'order-1',
        userId: 'user-1',
        status: OrderStatus.PENDING,
        totalAmount: 12000,
        latitude: -23.55,
        longitude: -46.63,
      }));
    });
  });
});

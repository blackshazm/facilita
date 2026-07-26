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

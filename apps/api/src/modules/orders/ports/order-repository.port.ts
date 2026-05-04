import { Order } from '../core/order.entity';

export interface OrderRepositoryPort {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
  findByUserId(userId: string): Promise<Order[]>;
  calculateDistance(orderId: string, lat: number, lng: number): Promise<number>;
}

export const ORDER_REPOSITORY_PORT = Symbol('OrderRepositoryPort');

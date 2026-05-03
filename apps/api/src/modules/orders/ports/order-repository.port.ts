import { Order } from '../core/order.entity';

export interface OrderRepositoryPort {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
  findByUserId(userId: string): Promise<Order[]>;
}

export const ORDER_REPOSITORY_PORT = Symbol('OrderRepositoryPort');

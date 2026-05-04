import { Injectable, Inject, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ORDER_REPOSITORY_PORT, OrderRepositoryPort } from '../ports/order-repository.port';
import { OrderStatus } from '../core/order.entity';

@Injectable()
export class OrderService {
  constructor(
    @Inject(ORDER_REPOSITORY_PORT) private readonly orderRepository: OrderRepositoryPort,
  ) {}

  async checkIn(orderId: string, lat: number, lng: number): Promise<void> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    const distance = await this.orderRepository.calculateDistance(orderId, lat, lng);
    
    if (distance > 500) {
      throw new ForbiddenException(`Location mismatch: ${Math.round(distance)}m from target. Limit is 500m.`);
    }

    order.updateStatus(OrderStatus.ARRIVED);
    await this.orderRepository.save(order);
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OrderMatchedEvent } from '../../../../shared/events/events';
import { AuthorizePaymentUseCase } from '../../application/authorize-payment.usecase';
import { OrderRepositoryPort, ORDER_REPOSITORY_PORT } from '../../../orders/ports/order-repository.port';

@Injectable()
export class OrderMatchedListener {
  constructor(
    private readonly authorizePayment: AuthorizePaymentUseCase,
    @Inject(ORDER_REPOSITORY_PORT)
    private readonly orderRepository: OrderRepositoryPort,
  ) {}

  @OnEvent('order.matched')
  async handleOrderMatched(event: OrderMatchedEvent) {
    // 1. Fetch order details
    const order = await this.orderRepository.findById(event.orderId);
    if (!order) return;

    // 2. Trigger authorization
    // In a real scenario, we'd get customer's default card/method
    await this.authorizePayment.execute({
      orderId: order.id,
      amount: order.toJSON().totalAmount, // Assuming it's in cents already
      customerId: order.toJSON().userId,
      paymentMethod: 'CARD', // Defaulting to CARD for now
      cardToken: 'tok_sandbox_default', // Sandbox token
    });
  }
}

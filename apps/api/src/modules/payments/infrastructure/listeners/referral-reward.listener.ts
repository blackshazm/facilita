import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { USER_REPOSITORY_PORT, UserRepositoryPort } from '../../../identity/ports/user-repository.port';
import { ORDER_REPOSITORY_PORT, OrderRepositoryPort } from '../../../orders/ports/order-repository.port';

@Injectable()
export class ReferralRewardListener {
  constructor(
    @InjectQueue('referral-reward') private readonly rewardQueue: Queue,
    @Inject(USER_REPOSITORY_PORT) private readonly userRepository: UserRepositoryPort,
    @Inject(ORDER_REPOSITORY_PORT) private readonly orderRepository: OrderRepositoryPort,
  ) {}

  @OnEvent('payment.captured')
  async handlePaymentCaptured(event: { orderId: string, customerId: string }) {
    const { orderId, customerId } = event;

    // 1. Check if user was referred
    const user = await this.userRepository.findById(customerId);
    if (!user || !user.invitedById) return;

    // 2. Check if it's their first order
    const orders = await this.orderRepository.findByUserId(customerId);
    const paidOrders = orders.filter(o => o.status === 'DONE'); // We assume DONE means PAID if capture succeeded

    if (paidOrders.length === 1) {
      // It's the first completed order
      await this.rewardQueue.add(
        'process-reward',
        {
          orderId,
          refereeId: customerId,
          referrerId: user.invitedById,
        },
        {
          jobId: orderId, // Use orderId as jobId to allow easy removal
          delay: 15 * 24 * 60 * 60 * 1000, // 15 days
          removeOnComplete: true,
        },
      );
    }
  }

  @OnEvent('order.cancelled')
  @OnEvent('payment.refunded')
  async handleOrderCancelled(event: { orderId: string }) {
    // Remove the reward job if order is cancelled or refunded
    await this.rewardQueue.remove(event.orderId);
  }
}

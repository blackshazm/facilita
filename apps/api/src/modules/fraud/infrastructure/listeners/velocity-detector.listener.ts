import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../../../shared-kernel/database/prisma.service';

@Injectable()
export class VelocityDetectorListener {
  constructor(private readonly prisma: PrismaService) {}

  @OnEvent('order.completed')
  async handleOrderCompleted(payload: { orderId: string; providerId: string }) {
    const { providerId } = payload;
    
    // Count orders in the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const count = await this.prisma.order.count({
      where: {
        providerId,
        status: 'DONE',
        updatedAt: {
          gte: twentyFourHoursAgo,
        },
      },
    });

    if (count > 20) {
      await this.prisma.providerProfile.update({
        where: { userId: providerId },
        data: {
          isFlagged: true,
          fraudReason: 'VELOCITY_LIMIT_EXCEEDED',
        },
      });
      
      console.log(`[Fraud] Provider ${providerId} flagged for velocity limit (count: ${count})`);
      // TODO: Emit event to pause payouts
    }
  }
}

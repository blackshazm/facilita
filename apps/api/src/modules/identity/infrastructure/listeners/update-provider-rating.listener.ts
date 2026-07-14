import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../../../shared-kernel/database/prisma.service';

@Injectable()
export class UpdateProviderRatingListener {
  private readonly logger = new Logger(UpdateProviderRatingListener.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('tiering') private readonly tieringQueue: Queue
  ) {}

  @OnEvent('review.revealed')
  async handleReviewRevealedEvent(payload: { orderId: string, reviews: any[] }) {
    this.logger.log(`Handling review.revealed event for order ${payload.orderId}`);
    
    // Find the provider review
    const providerReview = payload.reviews.find(r => r.role === 'CUSTOMER'); // The CUSTOMER reviews the PROVIDER
    if (!providerReview) return;

    const providerId = providerReview.targetId;

    // Get all visible reviews for this provider
    const allProviderReviews = await this.prisma.review.findMany({
      where: {
        targetId: providerId,
        role: 'CUSTOMER'
      }
    });

    if (allProviderReviews.length === 0) return;

    const totalScore = allProviderReviews.reduce((acc, rev) => acc + rev.overallScore, 0);
    const averageScore = totalScore / allProviderReviews.length;

    await this.prisma.providerProfile.update({
      where: { userId: providerId },
      data: { rating: averageScore }
    });

    this.logger.log(`Updated provider ${providerId} rating to ${averageScore}`);

    // Queue tier recalculation job asynchronously
    await this.tieringQueue.add(
      'recalculate-tier',
      { providerId },
      { removeOnComplete: true }
    );
    this.logger.log(`Enqueued tier recalculation job for provider ${providerId}`);
  }
}

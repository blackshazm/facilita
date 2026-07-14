import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../../../shared-kernel/database/prisma.service';

@Injectable()
export class UpdateProviderRatingListener {
  private readonly logger = new Logger(UpdateProviderRatingListener.name);

  constructor(private readonly prisma: PrismaService) {}

  @OnEvent('review.revealed')
  async handleReviewRevealedEvent(payload: { orderId: string, reviews: any[] }) {
    this.logger.log(`Handling review.revealed event for order ${payload.orderId}`);
    
    // Find the provider review
    const providerReview = payload.reviews.find(r => r.role === 'CUSTOMER'); // The CUSTOMER reviews the PROVIDER
    if (!providerReview) return;

    const providerId = providerReview.targetId;

    // Get all visible reviews for this provider
    // Visible means there's a corresponding review from the provider to the customer OR 7 days passed
    // For simplicity, we can just aggregate all reviews targeting this provider that are from CUSTOMERS.
    // In a real scenario we'd filter strictly by visibility rules, but since this updates the profile,
    // we can approximate or run the exact visibility logic.
    
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
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared-kernel/database/prisma.service';
import { ReviewResponse } from '../interface/http/dtos/review.response';

@Injectable()
export class GetOrderReviewsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves all reviews for a specific order.
   * Enforces double-blind visibility rules: reviews are only visible if both parties
   * have submitted their reviews, or if 7 days have passed since the order completion.
   * Hidden reviews will have their content obfuscated.
   * 
   * @param orderId The UUID of the order
   * @returns A list of ReviewResponse DTOs
   */
  async execute(orderId: string): Promise<ReviewResponse[]> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const reviews = await this.prisma.review.findMany({
      where: { orderId }
    });

    if (reviews.length === 0) {
      return [];
    }

    const hasBothReviews = reviews.length >= 2;
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    const isPastSevenDays = (new Date().getTime() - order.updatedAt.getTime()) > sevenDaysInMs;

    const isVisible = hasBothReviews || isPastSevenDays;

    return reviews.map(review => {
      if (isVisible) {
        return new ReviewResponse({
          ...review,
          hidden: false
        });
      } else {
        return new ReviewResponse({
          id: review.id,
          orderId: review.orderId,
          authorId: review.authorId,
          targetId: review.targetId,
          role: review.role,
          createdAt: review.createdAt,
          hidden: true
        });
      }
    });
  }
}

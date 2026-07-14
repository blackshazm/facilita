import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../shared-kernel/database/prisma.service';
import { SubmitReviewDto } from '../interface/http/dtos/submit-review.dto';
import { ReviewRole } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class SubmitReviewUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  /**
   * Submits a new review for an order.
   * Validates rules specific to Customer and Provider roles, aggregates scores,
   * and dispatches a 'review.revealed' event if both parties have reviewed.
   *
   * @param orderId The UUID of the order
   * @param authorId The UUID of the author
   * @param dto The review payload
   */
  async execute(orderId: string, authorId: string, dto: SubmitReviewDto) {
    if (dto.photoUrls && dto.photoUrls.length > 3) {
      throw new BadRequestException('Maximum of 3 photos allowed');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    const targetId = this.resolveTargetId(dto.role, order);

    const existingReview = await this.prisma.review.findFirst({
      where: { orderId, authorId }
    });

    if (existingReview) {
      throw new BadRequestException('You have already submitted a review for this order');
    }

    const overallScore = this.calculateOverallScore(dto);

    const review = await this.prisma.review.create({
      data: {
        orderId,
        authorId,
        targetId,
        role: dto.role,
        punctualityScore: dto.punctualityScore,
        technicalScore: dto.technicalScore,
        cleanlinessScore: dto.cleanlinessScore,
        overallScore,
        comment: dto.comment,
        photoUrls: dto.photoUrls || []
      }
    });

    await this.checkAndEmitRevealedEvent(orderId, targetId, review);

    return review;
  }

  private resolveTargetId(role: ReviewRole, order: any): string {
    if (role === ReviewRole.CUSTOMER) {
      if (!order.providerId) throw new BadRequestException('Order has no provider assigned');
      return order.providerId;
    }
    return order.userId;
  }

  private calculateOverallScore(dto: SubmitReviewDto): number {
    if (dto.role === ReviewRole.CUSTOMER) {
      if (!dto.punctualityScore || !dto.technicalScore || !dto.cleanlinessScore) {
        throw new BadRequestException('Customer reviews must include punctuality, technical, and cleanliness scores');
      }
      return (dto.punctualityScore + dto.technicalScore + dto.cleanlinessScore) / 3;
    }
    
    if (!dto.overallScore) {
      throw new BadRequestException('Provider reviews must include an overall score');
    }
    return dto.overallScore;
  }

  private async checkAndEmitRevealedEvent(orderId: string, targetId: string, review: any): Promise<void> {
    const otherReview = await this.prisma.review.findFirst({
      where: {
        orderId,
        authorId: targetId
      }
    });

    if (otherReview) {
      this.eventEmitter.emit('review.revealed', {
        orderId,
        reviews: [review, otherReview]
      });
    }
  }
}

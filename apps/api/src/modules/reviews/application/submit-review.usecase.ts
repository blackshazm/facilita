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
    if (!dto.photoUrls || dto.photoUrls.length === 0) {
      throw new BadRequestException('At least 1 photo is required');
    }
    if (dto.photoUrls.length > 3) {
      throw new BadRequestException('Maximum of 3 photos allowed');
    }
    if (dto.isPositive === undefined) {
      throw new BadRequestException('isPositive is required');
    }
    if (dto.isPositive === false && (!dto.tags || dto.tags.length === 0)) {
      throw new BadRequestException('Tags are required for negative reviews');
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

    const overallScore = dto.isPositive ? 5.0 : 1.0;

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
        isPositive: dto.isPositive,
        tags: dto.tags || [],
        comment: dto.comment,
        photoUrls: dto.photoUrls || []
      }
    });

    await this.checkAndEmitRevealedEvent(orderId, targetId, review);

    // Resolução Antifraude v4.1 (#67): Se o cliente reportou oferta fora da plataforma, registrar sinal crítico
    if (dto.offPlatformOffered === true && dto.role === ReviewRole.CUSTOMER) {
      if ((this.prisma as any).fraudSignal) {
        await (this.prisma as any).fraudSignal.create({
          data: {
            entityType: 'PROVIDER',
            entityId: targetId,
            signalType: 'OFF_PLATFORM_PROPOSAL',
            severity: 'CRITICAL',
            metadata: {
              orderId,
              reportedBy: authorId,
            },
          },
        });
      }
      this.eventEmitter.emit('fraud.off_platform_reported', {
        orderId,
        providerId: targetId,
        reportedBy: authorId,
      });
    }

    return review;
  }

  private resolveTargetId(role: ReviewRole, order: any): string {
    if (role === ReviewRole.CUSTOMER) {
      if (!order.providerId) throw new BadRequestException('Order has no provider assigned');
      return order.providerId;
    }
    return order.userId;
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

import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { SubmitReviewUseCase } from '../application/submit-review.usecase';
import { PrismaService } from '../../../shared-kernel/database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException } from '@nestjs/common';
import { ReviewRole } from '@prisma/client';

describe('SubmitReviewUseCase', () => {
  let useCase: SubmitReviewUseCase;
  let prisma: any;
  let eventEmitter: any;

  beforeEach(async () => {
    prisma = {
      order: {
        findUnique: jest.fn(),
      },
      review: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };
    eventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmitReviewUseCase,
        { provide: PrismaService, useValue: prisma },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    useCase = module.get<SubmitReviewUseCase>(SubmitReviewUseCase);
  });

  it('should throw BadRequestException if photoUrls is empty or missing', async () => {
    const dto = {
      role: ReviewRole.CUSTOMER,
      isPositive: true,
      photoUrls: [],
    };

    await expect(useCase.execute('order-1', 'author-1', dto)).rejects.toThrow(
      new BadRequestException('At least 1 photo is required')
    );
  });

  it('should throw BadRequestException if isPositive is undefined', async () => {
    const dto = {
      role: ReviewRole.CUSTOMER,
      photoUrls: ['url1'],
    };

    await expect(useCase.execute('order-1', 'author-1', dto as any)).rejects.toThrow(
      new BadRequestException('isPositive is required')
    );
  });

  it('should throw BadRequestException if review is negative and tags are missing', async () => {
    const dto = {
      role: ReviewRole.CUSTOMER,
      isPositive: false,
      photoUrls: ['url1'],
      tags: [],
    };

    await expect(useCase.execute('order-1', 'author-1', dto)).rejects.toThrow(
      new BadRequestException('Tags are required for negative reviews')
    );
  });

  it('should submit positive review successfully', async () => {
    const dto = {
      role: ReviewRole.CUSTOMER,
      isPositive: true,
      photoUrls: ['url1'],
    };

    prisma.order.findUnique.mockResolvedValue({ id: 'order-1', providerId: 'provider-1' });
    prisma.review.findFirst.mockResolvedValue(null);
    prisma.review.create.mockResolvedValue({ id: 'review-1', overallScore: 5.0 });

    const result = await useCase.execute('order-1', 'author-1', dto);

    expect(prisma.review.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          overallScore: 5.0,
          isPositive: true,
        }),
      })
    );
    expect(result).toBeDefined();
  });
});

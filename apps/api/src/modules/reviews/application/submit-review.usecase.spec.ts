import { SubmitReviewUseCase } from './submit-review.usecase';
import { BadRequestException } from '@nestjs/common';
import { ReviewRole } from '@prisma/client';

describe('SubmitReviewUseCase', () => {
  let useCase: SubmitReviewUseCase;
  let prisma: any;
  let eventEmitter: any;

  beforeEach(() => {
    prisma = {
      order: { findUnique: jest.fn() },
      review: {
        findFirst: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
      },
    };
    eventEmitter = { emit: jest.fn() };
    useCase = new SubmitReviewUseCase(prisma, eventEmitter);
  });

  const validDto = {
    role: ReviewRole.CUSTOMER,
    punctualityScore: 5,
    technicalScore: 5,
    cleanlinessScore: 5,
    isPositive: true,
    tags: [],
    comment: 'Ótimo serviço!',
    photoUrls: ['https://example.com/photo1.jpg'],
  };

  it('should create a review successfully', async () => {
    prisma.order.findUnique.mockResolvedValue({ id: 'o1', userId: 'u1', providerId: 'p1' });
    prisma.review.findFirst.mockResolvedValue(null); // no existing review
    prisma.review.create.mockResolvedValue({ id: 'rev-1', ...validDto });

    const result = await useCase.execute('o1', 'u1', validDto);

    expect(result.id).toBe('rev-1');
    expect(prisma.review.create).toHaveBeenCalled();
  });

  it('should throw if no photos provided', async () => {
    await expect(
      useCase.execute('o1', 'u1', { ...validDto, photoUrls: [] }),
    ).rejects.toThrow('At least 1 photo is required');
  });

  it('should throw if more than 3 photos', async () => {
    await expect(
      useCase.execute('o1', 'u1', { ...validDto, photoUrls: ['a', 'b', 'c', 'd'] }),
    ).rejects.toThrow('Maximum of 3 photos allowed');
  });

  it('should throw if isPositive is undefined', async () => {
    await expect(
      useCase.execute('o1', 'u1', { ...validDto, isPositive: undefined as any }),
    ).rejects.toThrow('isPositive is required');
  });

  it('should throw if negative review has no tags', async () => {
    await expect(
      useCase.execute('o1', 'u1', { ...validDto, isPositive: false, tags: [] }),
    ).rejects.toThrow('Tags are required for negative reviews');
  });

  it('should throw if order not found', async () => {
    prisma.order.findUnique.mockResolvedValue(null);

    await expect(
      useCase.execute('o-invalid', 'u1', validDto),
    ).rejects.toThrow('Order not found');
  });

  it('should throw if user already reviewed this order', async () => {
    prisma.order.findUnique.mockResolvedValue({ id: 'o1', userId: 'u1', providerId: 'p1' });
    prisma.review.findFirst.mockResolvedValue({ id: 'existing-review' });

    await expect(
      useCase.execute('o1', 'u1', validDto),
    ).rejects.toThrow('You have already submitted a review');
  });

  it('should set overallScore to 5 for positive reviews', async () => {
    prisma.order.findUnique.mockResolvedValue({ id: 'o1', userId: 'u1', providerId: 'p1' });
    prisma.review.findFirst
      .mockResolvedValueOnce(null) // no existing review from author
      .mockResolvedValueOnce(null); // no other review (no reveal)
    prisma.review.create.mockResolvedValue({ id: 'rev-1' });

    await useCase.execute('o1', 'u1', validDto);

    expect(prisma.review.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ overallScore: 5.0 }),
    });
  });

  it('should set overallScore to 1 for negative reviews', async () => {
    prisma.order.findUnique.mockResolvedValue({ id: 'o1', userId: 'u1', providerId: 'p1' });
    prisma.review.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    prisma.review.create.mockResolvedValue({ id: 'rev-2' });

    await useCase.execute('o1', 'u1', {
      ...validDto,
      isPositive: false,
      tags: ['ATRASO'],
    });

    expect(prisma.review.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ overallScore: 1.0 }),
    });
  });

  it('should emit review.revealed when both parties have reviewed', async () => {
    const otherReview = { id: 'rev-other', authorId: 'p1' };
    prisma.order.findUnique.mockResolvedValue({ id: 'o1', userId: 'u1', providerId: 'p1' });
    prisma.review.findFirst
      .mockResolvedValueOnce(null)         // no existing review from author
      .mockResolvedValueOnce(otherReview); // other party already reviewed
    prisma.review.create.mockResolvedValue({ id: 'rev-new' });

    await useCase.execute('o1', 'u1', validDto);

    expect(eventEmitter.emit).toHaveBeenCalledWith(
      'review.revealed',
      expect.objectContaining({ orderId: 'o1' }),
    );
  });

  it('should create a CRITICAL FraudSignal when customer reports offPlatformOffered: true', async () => {
    prisma.order.findUnique.mockResolvedValue({ id: 'o1', userId: 'u1', providerId: 'p1' });
    prisma.review.findFirst.mockResolvedValue(null);
    prisma.review.create.mockResolvedValue({ id: 'rev-1', ...validDto });
    prisma.fraudSignal = { create: jest.fn().mockResolvedValue({ id: 'fs-1' }) };

    await useCase.execute('o1', 'u1', { ...validDto, offPlatformOffered: true });

    expect(prisma.fraudSignal.create).toHaveBeenCalledWith({
      data: {
        entityType: 'PROVIDER',
        entityId: 'p1',
        signalType: 'OFF_PLATFORM_PROPOSAL',
        severity: 'CRITICAL',
        metadata: {
          orderId: 'o1',
          reportedBy: 'u1',
        },
      },
    });
  });
});

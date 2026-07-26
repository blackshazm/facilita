import { GetOrderReviewsUseCase } from './get-order-reviews.usecase';
import { NotFoundException } from '@nestjs/common';

describe('GetOrderReviewsUseCase', () => {
  let useCase: GetOrderReviewsUseCase;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      order: { findUnique: jest.fn() },
      review: { findMany: jest.fn() },
    };
    useCase = new GetOrderReviewsUseCase(prisma);
  });

  it('should throw NotFoundException when order does not exist', async () => {
    prisma.order.findUnique.mockResolvedValue(null);

    await expect(useCase.execute('order-invalid')).rejects.toThrow(NotFoundException);
  });

  it('should return empty array when no reviews exist', async () => {
    prisma.order.findUnique.mockResolvedValue({ id: 'o1', updatedAt: new Date() });
    prisma.review.findMany.mockResolvedValue([]);

    const result = await useCase.execute('o1');
    expect(result).toEqual([]);
  });

  it('should return visible reviews when both parties have reviewed', async () => {
    prisma.order.findUnique.mockResolvedValue({ id: 'o1', updatedAt: new Date() });
    prisma.review.findMany.mockResolvedValue([
      { id: 'r1', orderId: 'o1', authorId: 'u1', targetId: 'p1', role: 'CUSTOMER', comment: 'Great', createdAt: new Date() },
      { id: 'r2', orderId: 'o1', authorId: 'p1', targetId: 'u1', role: 'PROVIDER', comment: 'Good client', createdAt: new Date() },
    ]);

    const result = await useCase.execute('o1');
    expect(result).toHaveLength(2);
    expect(result[0].hidden).toBe(false);
    expect(result[1].hidden).toBe(false);
  });

  it('should return hidden reviews when only one party has reviewed (within 7 days)', async () => {
    prisma.order.findUnique.mockResolvedValue({ id: 'o1', updatedAt: new Date() });
    prisma.review.findMany.mockResolvedValue([
      { id: 'r1', orderId: 'o1', authorId: 'u1', targetId: 'p1', role: 'CUSTOMER', createdAt: new Date() },
    ]);

    const result = await useCase.execute('o1');
    expect(result).toHaveLength(1);
    expect(result[0].hidden).toBe(true);
  });

  it('should reveal reviews after 7 days even if only one party reviewed', async () => {
    const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
    prisma.order.findUnique.mockResolvedValue({ id: 'o1', updatedAt: eightDaysAgo });
    prisma.review.findMany.mockResolvedValue([
      { id: 'r1', orderId: 'o1', authorId: 'u1', targetId: 'p1', role: 'CUSTOMER', comment: 'Nice', createdAt: eightDaysAgo },
    ]);

    const result = await useCase.execute('o1');
    expect(result).toHaveLength(1);
    expect(result[0].hidden).toBe(false);
  });
});

import { VelocityDetectorListener } from './velocity-detector.listener';

describe('VelocityDetectorListener', () => {
  let listener: VelocityDetectorListener;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      order: {
        count: jest.fn(),
      },
      providerProfile: {
        update: jest.fn().mockResolvedValue({}),
      },
    };
    listener = new VelocityDetectorListener(prisma);
  });

  it('should flag provider when order count exceeds 20 in 24h', async () => {
    prisma.order.count.mockResolvedValue(21);

    await listener.handleOrderCompleted({
      orderId: 'order-1',
      providerId: 'provider-1',
    });

    expect(prisma.providerProfile.update).toHaveBeenCalledWith({
      where: { userId: 'provider-1' },
      data: {
        isFlagged: true,
        fraudReason: 'VELOCITY_LIMIT_EXCEEDED',
      },
    });
  });

  it('should not flag provider when order count is exactly 20', async () => {
    prisma.order.count.mockResolvedValue(20);

    await listener.handleOrderCompleted({
      orderId: 'order-2',
      providerId: 'provider-2',
    });

    expect(prisma.providerProfile.update).not.toHaveBeenCalled();
  });

  it('should not flag provider when order count is below 20', async () => {
    prisma.order.count.mockResolvedValue(5);

    await listener.handleOrderCompleted({
      orderId: 'order-3',
      providerId: 'provider-3',
    });

    expect(prisma.providerProfile.update).not.toHaveBeenCalled();
  });

  it('should query orders in the last 24 hours with DONE status', async () => {
    prisma.order.count.mockResolvedValue(0);

    await listener.handleOrderCompleted({
      orderId: 'order-4',
      providerId: 'provider-4',
    });

    expect(prisma.order.count).toHaveBeenCalledWith({
      where: expect.objectContaining({
        providerId: 'provider-4',
        status: 'DONE',
        updatedAt: expect.objectContaining({
          gte: expect.any(Date),
        }),
      }),
    });
  });
});

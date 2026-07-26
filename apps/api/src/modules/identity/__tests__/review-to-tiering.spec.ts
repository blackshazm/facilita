import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { getQueueToken } from '@nestjs/bullmq';
import { PrismaService } from '../../../shared-kernel/database/prisma.service';
import { UpdateProviderRatingListener } from '../infrastructure/listeners/update-provider-rating.listener';

describe('Review to Tiering Integration', () => {
  let eventEmitter: EventEmitter2;
  let prismaService: any;
  let tieringQueue: any;

  beforeEach(async () => {
    prismaService = {
      review: {
        findMany: jest.fn().mockResolvedValue([
          { overallScore: 5 },
          { overallScore: 4 }
        ]),
      },
      providerProfile: {
        update: jest.fn().mockResolvedValue({}),
      },
    };

    tieringQueue = {
      add: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot()],
      providers: [
        UpdateProviderRatingListener,
        { provide: PrismaService, useValue: prismaService },
        { provide: getQueueToken('tiering'), useValue: tieringQueue },
      ],
    }).compile();

    await module.init();

    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  it('should update provider rating and enqueue recalculation job when review.revealed is emitted', async () => {
    // Arrange
    const payload = {
      orderId: 'order-1',
      reviews: [
        { role: 'CUSTOMER', targetId: 'provider-1' },
      ],
    };

    // Act
    await eventEmitter.emitAsync('review.revealed', payload);

    // Assert
    // Average score should be (5+4)/2 = 4.5
    expect(prismaService.providerProfile.update).toHaveBeenCalledWith({
      where: { userId: 'provider-1' },
      data: { rating: 4.5 },
    });
    
    expect(tieringQueue.add).toHaveBeenCalledWith(
      'recalculate-tier',
      { providerId: 'provider-1' },
      { removeOnComplete: true },
    );
  });
});

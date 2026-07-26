import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaService } from '../../../shared-kernel/database/prisma.service';
import { VelocityDetectorListener } from '../infrastructure/listeners/velocity-detector.listener';

describe('Fraud Velocity Integration', () => {
  let eventEmitter: EventEmitter2;
  let prismaService: any;

  beforeEach(async () => {
    prismaService = {
      order: {
        count: jest.fn().mockResolvedValue(21), // Simulate > 20 orders
      },
      providerProfile: {
        update: jest.fn().mockResolvedValue({}),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot()],
      providers: [
        VelocityDetectorListener,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    await module.init();

    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  it('should flag provider if velocity limit is exceeded on order.completed', async () => {
    // Act
    await eventEmitter.emitAsync('order.completed', {
      orderId: 'order-1',
      providerId: 'provider-1',
    });

    // Assert
    expect(prismaService.order.count).toHaveBeenCalledTimes(1);
    expect(prismaService.providerProfile.update).toHaveBeenCalledTimes(1);
    expect(prismaService.providerProfile.update).toHaveBeenCalledWith({
      where: { userId: 'provider-1' },
      data: {
        isFlagged: true,
        fraudReason: 'VELOCITY_LIMIT_EXCEEDED',
      },
    });
  });

  it('should NOT flag provider if velocity limit is NOT exceeded', async () => {
    // Arrange
    prismaService.order.count.mockResolvedValueOnce(5);

    // Act
    await eventEmitter.emitAsync('order.completed', {
      orderId: 'order-2',
      providerId: 'provider-2',
    });

    // Assert
    expect(prismaService.order.count).toHaveBeenCalledTimes(1);
    expect(prismaService.providerProfile.update).not.toHaveBeenCalled(); // Not called again
  });
});

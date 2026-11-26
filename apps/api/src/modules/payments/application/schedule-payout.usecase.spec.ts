import { Test, TestingModule } from '@nestjs/testing';
import { SchedulePayoutUseCase } from './schedule-payout.usecase';
import { getQueueToken } from '@nestjs/bullmq';

describe('SchedulePayoutUseCase', () => {
  let useCase: SchedulePayoutUseCase;
  let mockQueue: { add: jest.Mock };

  beforeEach(async () => {
    mockQueue = { add: jest.fn().mockResolvedValue({}) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulePayoutUseCase,
        {
          provide: getQueueToken('payouts'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    useCase = module.get<SchedulePayoutUseCase>(SchedulePayoutUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should schedule D+3 payout for BRONZE tier (v4.1 #35)', async () => {
    await useCase.execute('prov-1', 100, 'BRONZE');

    const expectedDelay = 3 * 24 * 60 * 60 * 1000; // 3 dias
    expect(mockQueue.add).toHaveBeenCalledWith(
      'release-payout',
      { providerId: 'prov-1', amount: 100 },
      expect.objectContaining({ delay: expectedDelay }),
    );
  });

  it('should schedule D+2 payout for PRATA tier (v4.1 #35)', async () => {
    await useCase.execute('prov-2', 150, 'PRATA');

    const expectedDelay = 2 * 24 * 60 * 60 * 1000; // 2 dias
    expect(mockQueue.add).toHaveBeenCalledWith(
      'release-payout',
      { providerId: 'prov-2', amount: 150 },
      expect.objectContaining({ delay: expectedDelay }),
    );
  });

  it('should schedule D+1 payout for OURO tier (v4.1 #35)', async () => {
    await useCase.execute('prov-3', 200, 'OURO');

    const expectedDelay = 1 * 24 * 60 * 60 * 1000; // 1 dia (24h)
    expect(mockQueue.add).toHaveBeenCalledWith(
      'release-payout',
      { providerId: 'prov-3', amount: 200 },
      expect.objectContaining({ delay: expectedDelay }),
    );
  });
});

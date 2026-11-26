import { Test, TestingModule } from '@nestjs/testing';
import { ProcessDailyPayoutsUseCase } from './process-daily-payouts.usecase';
import { PROVIDER_REPOSITORY_PORT } from '../../identity/ports/provider-repository.port';
import { getQueueToken } from '@nestjs/bullmq';

describe('ProcessDailyPayoutsUseCase', () => {
  let provider: ProcessDailyPayoutsUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessDailyPayoutsUseCase,
        {
          provide: 'WalletRepositoryPort',
          useValue: { findWalletsWithBalance: jest.fn(), save: jest.fn() },
        },
        {
          provide: 'PayoutRepositoryPort',
          useValue: { save: jest.fn() },
        },
        {
          provide: PROVIDER_REPOSITORY_PORT,
          useValue: { findById: jest.fn() },
        },
        {
          provide: getQueueToken('payout-execution'),
          useValue: { add: jest.fn() },
        },
      ],
    }).compile();

    provider = module.get<ProcessDailyPayoutsUseCase>(ProcessDailyPayoutsUseCase);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

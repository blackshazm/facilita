import { Test, TestingModule } from '@nestjs/testing';
import { SchedulePayoutUseCase } from './schedule-payout.usecase';
import { PAYOUT_GATEWAY_PORT } from '../ports/payout-gateway.port';
import { PAYOUT_REPOSITORY_PORT } from '../ports/payout-repository.port';

describe('SchedulePayoutUseCase', () => {
  let provider: SchedulePayoutUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulePayoutUseCase,
        { provide: PAYOUT_GATEWAY_PORT, useValue: { schedulePayout: jest.fn() } },
        { provide: PAYOUT_REPOSITORY_PORT, useValue: { save: jest.fn() } },
      ],
    }).compile();

    provider = module.get<SchedulePayoutUseCase>(SchedulePayoutUseCase);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

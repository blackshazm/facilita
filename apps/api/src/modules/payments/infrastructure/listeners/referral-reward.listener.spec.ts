import { Test, TestingModule } from '@nestjs/testing';
import { ReferralRewardListener } from './referral-reward.listener';
import { getQueueToken } from '@nestjs/bullmq';
import { USER_REPOSITORY_PORT } from '../../../identity/ports/user-repository.port';
import { ORDER_REPOSITORY_PORT } from '../../../orders/ports/order-repository.port';

describe('ReferralRewardListener', () => {
  let provider: ReferralRewardListener;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReferralRewardListener,
        {
          provide: getQueueToken('referral-reward'),
          useValue: { add: jest.fn(), remove: jest.fn() },
        },
        {
          provide: USER_REPOSITORY_PORT,
          useValue: { findById: jest.fn() },
        },
        {
          provide: ORDER_REPOSITORY_PORT,
          useValue: { findByUserId: jest.fn() },
        },
      ],
    }).compile();

    provider = module.get<ReferralRewardListener>(ReferralRewardListener);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

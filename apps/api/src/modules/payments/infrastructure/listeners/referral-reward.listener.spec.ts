import { Test, TestingModule } from '@nestjs/testing';
import { ReferralRewardListener } from './referral-reward.listener';

describe('ReferralRewardListener', () => {
  let provider: ReferralRewardListener;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReferralRewardListener,
        // TODO: Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<ReferralRewardListener>(ReferralRewardListener);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

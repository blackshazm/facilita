import { Test, TestingModule } from '@nestjs/testing';
import { ReverseFailedPayoutUseCase } from './reverse-failed-payout.usecase';

describe('ReverseFailedPayoutUseCase', () => {
  let provider: ReverseFailedPayoutUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReverseFailedPayoutUseCase,
        // TODO: Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<ReverseFailedPayoutUseCase>(ReverseFailedPayoutUseCase);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

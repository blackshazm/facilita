import { Test, TestingModule } from '@nestjs/testing';
import { StartBatchPayoutUseCase } from './start-batch-payout.usecase';

describe('StartBatchPayoutUseCase', () => {
  let provider: StartBatchPayoutUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StartBatchPayoutUseCase,
        // TODO: Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<StartBatchPayoutUseCase>(StartBatchPayoutUseCase);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

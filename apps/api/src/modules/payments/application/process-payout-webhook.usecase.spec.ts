import { Test, TestingModule } from '@nestjs/testing';
import { ProcessPayoutWebhookUseCase } from './process-payout-webhook.usecase';

describe('ProcessPayoutWebhookUseCase', () => {
  let provider: ProcessPayoutWebhookUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessPayoutWebhookUseCase,
        // TODO: Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<ProcessPayoutWebhookUseCase>(ProcessPayoutWebhookUseCase);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

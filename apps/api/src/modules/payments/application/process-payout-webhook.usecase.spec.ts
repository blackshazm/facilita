import { Test, TestingModule } from '@nestjs/testing';
import { ProcessPayoutWebhookUseCase } from './process-payout-webhook.usecase';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('ProcessPayoutWebhookUseCase', () => {
  let provider: ProcessPayoutWebhookUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessPayoutWebhookUseCase,
        {
          provide: 'PayoutRepositoryPort',
          useValue: { findByExternalId: jest.fn(), save: jest.fn() },
        },
        {
          provide: EventEmitter2,
          useValue: { emit: jest.fn() },
        },
      ],
    }).compile();

    provider = module.get<ProcessPayoutWebhookUseCase>(ProcessPayoutWebhookUseCase);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

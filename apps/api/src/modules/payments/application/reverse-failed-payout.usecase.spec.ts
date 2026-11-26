import { Test, TestingModule } from '@nestjs/testing';
import { ReverseFailedPayoutUseCase } from './reverse-failed-payout.usecase';

describe('ReverseFailedPayoutUseCase', () => {
  let provider: ReverseFailedPayoutUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReverseFailedPayoutUseCase,
        {
          provide: 'WalletRepositoryPort',
          useValue: { findByProviderId: jest.fn(), save: jest.fn() },
        },
        {
          provide: 'PayoutRepositoryPort',
          useValue: { findById: jest.fn(), save: jest.fn() },
        },
      ],
    }).compile();

    provider = module.get<ReverseFailedPayoutUseCase>(ReverseFailedPayoutUseCase);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

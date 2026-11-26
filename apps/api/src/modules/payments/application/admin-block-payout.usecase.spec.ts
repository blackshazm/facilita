import { Test, TestingModule } from '@nestjs/testing';
import { AdminBlockPayoutUseCase } from './admin-block-payout.usecase';
import { FinancialAuditService } from '../../../shared-kernel/services/financial-audit.service';

describe('AdminBlockPayoutUseCase', () => {
  let provider: AdminBlockPayoutUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminBlockPayoutUseCase,
        {
          provide: 'PayoutRepositoryPort',
          useValue: { findById: jest.fn(), save: jest.fn() },
        },
        {
          provide: FinancialAuditService,
          useValue: { log: jest.fn() },
        },
      ],
    }).compile();

    provider = module.get<AdminBlockPayoutUseCase>(AdminBlockPayoutUseCase);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

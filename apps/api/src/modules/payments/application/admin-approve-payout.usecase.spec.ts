import { Test, TestingModule } from '@nestjs/testing';
import { AdminApprovePayoutUseCase } from './admin-approve-payout.usecase';
import { FinancialAuditService } from '../../../shared-kernel/services/financial-audit.service';

describe('AdminApprovePayoutUseCase', () => {
  let provider: AdminApprovePayoutUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminApprovePayoutUseCase,
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

    provider = module.get<AdminApprovePayoutUseCase>(AdminApprovePayoutUseCase);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

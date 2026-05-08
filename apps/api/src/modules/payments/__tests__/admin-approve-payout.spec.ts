import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { AdminApprovePayoutUseCase } from '../application/admin-approve-payout.usecase';
import { PayoutRepositoryPort, PayoutStatus } from '../ports/payout-repository.port';
import { FinancialAuditService } from '../../../shared-kernel/services/financial-audit.service';

describe('AdminApprovePayoutUseCase', () => {
  let useCase: AdminApprovePayoutUseCase;
  let payoutRepo: any;
  let auditService: any;

  beforeEach(async () => {
    payoutRepo = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    auditService = {
      log: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminApprovePayoutUseCase,
        { provide: 'PayoutRepositoryPort', useValue: payoutRepo },
        { provide: FinancialAuditService, useValue: auditService },
      ],
    }).compile();

    useCase = module.get<AdminApprovePayoutUseCase>(AdminApprovePayoutUseCase);
  });

  it('should approve a payout that is PENDING_APPROVAL', async () => {
    const payout = {
      id: 'pay-1',
      status: PayoutStatus.PENDING_APPROVAL,
      amount: 500000n,
      providerId: 'prov-1',
    };
    payoutRepo.findById.mockResolvedValue(payout);

    await useCase.execute('pay-1', 'admin-1');

    expect(payoutRepo.save).toHaveBeenCalledWith(expect.objectContaining({
      id: 'pay-1',
      status: PayoutStatus.PROCESSING,
    }));
    expect(auditService.log).toHaveBeenCalledWith(expect.objectContaining({
      actorId: 'admin-1',
      action: 'PAYOUT_MANUAL_OVERRIDE_APPROVE',
    }));
  });

  it('should reject if payout is not PENDING_APPROVAL', async () => {
    const payout = {
      id: 'pay-1',
      status: PayoutStatus.PROCESSING,
      amount: 500000n,
      providerId: 'prov-1',
    };
    payoutRepo.findById.mockResolvedValue(payout);

    await expect(useCase.execute('pay-1', 'admin-1')).rejects.toThrow('Payout is not pending approval');
    expect(payoutRepo.save).not.toHaveBeenCalled();
  });
});

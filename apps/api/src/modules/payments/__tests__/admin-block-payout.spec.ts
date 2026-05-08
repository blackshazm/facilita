import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { AdminBlockPayoutUseCase } from '../application/admin-block-payout.usecase';
import { PayoutRepositoryPort, PayoutStatus } from '../ports/payout-repository.port';
import { FinancialAuditService } from '../../../shared-kernel/services/financial-audit.service';

describe('AdminBlockPayoutUseCase', () => {
  let useCase: AdminBlockPayoutUseCase;
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
        AdminBlockPayoutUseCase,
        { provide: 'PayoutRepositoryPort', useValue: payoutRepo },
        { provide: FinancialAuditService, useValue: auditService },
      ],
    }).compile();

    useCase = module.get<AdminBlockPayoutUseCase>(AdminBlockPayoutUseCase);
  });

  it('should block a payout that is PENDING_APPROVAL', async () => {
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
      status: PayoutStatus.FAILED, // Or CANCELLED, using FAILED as per spec/context
    }));
    expect(auditService.log).toHaveBeenCalledWith(expect.objectContaining({
      actorId: 'admin-1',
      action: 'PAYOUT_MANUAL_OVERRIDE_BLOCK',
    }));
  });

  it('should reject if payout is not PENDING_APPROVAL', async () => {
    const payout = {
      id: 'pay-1',
      status: PayoutStatus.PAID,
      amount: 500000n,
      providerId: 'prov-1',
    };
    payoutRepo.findById.mockResolvedValue(payout);

    await expect(useCase.execute('pay-1', 'admin-1')).rejects.toThrow('Payout is not pending approval');
    expect(payoutRepo.save).not.toHaveBeenCalled();
  });
});

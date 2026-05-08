import { Inject, Injectable } from '@nestjs/common';
import { PayoutRepositoryPort, PayoutStatus } from '../ports/payout-repository.port';
import { FinancialAuditService } from '../../../shared-kernel/services/financial-audit.service';

@Injectable()
export class AdminApprovePayoutUseCase {
  constructor(
    @Inject('PayoutRepositoryPort')
    private readonly payoutRepository: PayoutRepositoryPort,
    private readonly auditService: FinancialAuditService,
  ) {}

  async execute(payoutId: string, adminId: string): Promise<void> {
    const payout = await this.payoutRepository.findById(payoutId);
    if (!payout) {
      throw new Error('Payout not found');
    }

    if (payout.status !== PayoutStatus.PENDING_APPROVAL) {
      throw new Error('Payout is not pending approval');
    }

    const before = { ...payout };
    payout.status = PayoutStatus.PROCESSING;
    payout.updatedAt = new Date();

    await this.payoutRepository.save(payout);

    await this.auditService.log({
      actorId: adminId,
      actorType: 'ADMIN',
      action: 'PAYOUT_MANUAL_OVERRIDE_APPROVE',
      entityType: 'Payout',
      entityId: payout.id,
      before,
      after: payout,
      metadata: { timestamp: new Date() },
    });
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PayoutRepositoryPort, PayoutStatus } from '../ports/payout-repository.port';
import { FinancialAuditService } from '../../../shared-kernel/services/financial-audit.service';
import { PrismaService } from '../../../shared-kernel/database/prisma.service';
import { BATCH_PAYOUT_QUEUE } from '../infrastructure/queues/queue.constants';

@Injectable()
export class StartBatchPayoutUseCase {
  constructor(
    @Inject('PayoutRepositoryPort')
    private readonly payoutRepository: PayoutRepositoryPort,
    private readonly auditService: FinancialAuditService,
    private readonly prisma: PrismaService,
    @InjectQueue(BATCH_PAYOUT_QUEUE)
    private readonly batchQueue: Queue,
  ) {}

  async execute(payoutIds: string[], adminId: string): Promise<string> {
    // 1. Validar payouts
    const payouts = await Promise.all(
      payoutIds.map((id) => this.payoutRepository.findById(id))
    );

    const invalid = payouts.some(
      (p) => !p || p.status !== PayoutStatus.PENDING_APPROVAL
    );

    if (invalid) {
      throw new Error(
        'Alguns pagamentos selecionados não estão pendentes de aprovação ou não existem.'
      );
    }

    const totalAmount = payouts.reduce((acc, p) => acc + (p?.amount || 0n), 0n);

    // 2. Criar Batch no DB
    const batch = await this.prisma.payoutBatch.create({
      data: {
        adminId,
        totalAmount,
        totalCount: payoutIds.length,
        status: 'PROCESSING',
        lastHeartbeat: new Date(),
      },
    });

    // 3. Vincular payouts ao batch e atualizar status
    await this.prisma.payout.updateMany({
      where: { id: { in: payoutIds } },
      data: {
        batchId: batch.id,
        status: PayoutStatus.PROCESSING as any, // Cast para lidar com enum Prisma/Port mismatch se houver
        updatedAt: new Date(),
      },
    });

    // 4. Enfileirar jobs
    for (const payoutId of payoutIds) {
      await this.batchQueue.add(
        'payout-item',
        {
          batchId: batch.id,
          payoutId,
        },
        {
          removeOnComplete: true,
          attempts: 1, // Não retenta automaticamente para evitar race conditions, erro manual é melhor
        }
      );
    }

    // 5. Auditoria
    await this.auditService.log({
      actorId: adminId,
      actorType: 'ADMIN',
      action: 'PAYOUT_BATCH_START',
      entityType: 'PayoutBatch',
      entityId: batch.id,
      metadata: {
        count: payoutIds.length,
        totalAmount: totalAmount.toString(),
      },
    });

    return batch.id;
  }
}

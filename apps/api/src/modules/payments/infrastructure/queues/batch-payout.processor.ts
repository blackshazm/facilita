import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject, Logger } from '@nestjs/common';
import { PayoutPort } from '../../ports/payout.port';
import {
  PayoutRepositoryPort,
  PayoutStatus,
} from '../../ports/payout-repository.port';
import {
  PROVIDER_REPOSITORY_PORT,
  ProviderRepositoryPort,
} from '../../../identity/ports/provider-repository.port';
import { PrismaService } from '../../../../shared-kernel/database/prisma.service';
import { BATCH_PAYOUT_QUEUE } from './queue.constants';

@Processor(BATCH_PAYOUT_QUEUE)
export class BatchPayoutProcessor extends WorkerHost {
  private readonly logger = new Logger(BatchPayoutProcessor.name);

  constructor(
    @Inject('PayoutPort')
    private readonly payoutGateway: PayoutPort,
    @Inject('PayoutRepositoryPort')
    private readonly payoutRepository: PayoutRepositoryPort,
    @Inject(PROVIDER_REPOSITORY_PORT)
    private readonly providerRepository: ProviderRepositoryPort,
    private readonly prisma: PrismaService
  ) {
    super();
  }

  async process(job: Job<{ batchId: string; payoutId: string }>): Promise<any> {
    const { batchId, payoutId } = job.data;
    this.logger.log(`Processando job: batch=${batchId}, payout=${payoutId}`);

    // 1. Atualizar Heartbeat e checar status do lote
    const batch = await this.prisma.payoutBatch.update({
      where: { id: batchId },
      data: { lastHeartbeat: new Date() },
    });

    if (batch.status !== 'PROCESSING') {
      this.logger.warn(
        `Lote ${batchId} não está mais em processamento (Status: ${batch.status}). Cancelando job.`
      );
      return;
    }

    // 2. Carregar Payout
    const payout = await this.payoutRepository.findById(payoutId);
    if (!payout) {
      this.logger.error(`Payout ${payoutId} não encontrado.`);
      return;
    }

    try {
      // 3. Check Balance (Safety Gate)
      const masterRecipientId = process.env.PAGARME_MASTER_RECIPIENT_ID;
      if (!masterRecipientId) {
        throw new Error('PAGARME_MASTER_RECIPIENT_ID não configurado.');
      }

      const balance = await this.payoutGateway.getBalance(masterRecipientId);
      if (balance < payout.amount) {
        await this.prisma.payoutBatch.update({
          where: { id: batchId },
          data: {
            status: 'FAILED_NO_FUNDS',
            errorMessage: `Saldo insuficiente no gateway (${balance.toString()} < ${payout.amount.toString()}).`,
          },
        });
        throw new Error('Saldo insuficiente no gateway. Interrompendo lote.');
      }

      // 4. Obter Recipient ID do Provedor
      const provider = await this.providerRepository.findById(payout.providerId);
      if (!provider || !provider.pagarmeRecipientId) {
        throw new Error(
          `Provedor ${payout.providerId} não possui recipient_id configurado.`
        );
      }

      // 5. Executar Transferência
      const result = await this.payoutGateway.transfer({
        providerId: payout.providerId,
        recipientId: provider.pagarmeRecipientId,
        amount: payout.amount,
        idempotencyKey: payout.id, // Ledger UUID
        metadata: { batchId },
      });

      // 6. Atualizar Payout
      const updatedPayout = {
        ...payout,
        status: result.status as PayoutStatus,
        externalId: result.externalId,
        fee: result.fee,
        updatedAt: new Date(),
      };
      await this.payoutRepository.save(updatedPayout);

      // 7. Incrementar progresso do lote
      const updatedBatch = await this.prisma.payoutBatch.update({
        where: { id: batchId },
        data: {
          processedCount: { increment: 1 },
        },
      });

      // 8. Checar conclusão
      if (updatedBatch.processedCount === updatedBatch.totalCount) {
        await this.prisma.payoutBatch.update({
          where: { id: batchId },
          data: { status: 'COMPLETED' },
        });
      }
    } catch (error: any) {
      this.logger.error(
        `Erro ao processar payout ${payoutId} no lote ${batchId}: ${error.message}`
      );

      // Marcar payout como falho
      await this.prisma.payout.update({
        where: { id: payoutId },
        data: {
          status: 'FAILED' as any,
          updatedAt: new Date(),
        },
      });

      throw error;
    }
  }
}

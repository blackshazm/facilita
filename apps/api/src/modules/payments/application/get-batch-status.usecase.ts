import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared-kernel/database/prisma.service';

@Injectable()
export class GetBatchStatusUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(batchId: string) {
    const batch = await this.prisma.payoutBatch.findUnique({
      where: { id: batchId },
    });

    if (!batch) {
      throw new Error('Lote não encontrado.');
    }

    // Check for stale batch (Heartbeat > 5 mins)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (
      batch.status === 'PROCESSING' &&
      batch.lastHeartbeat &&
      batch.lastHeartbeat < fiveMinutesAgo
    ) {
      return this.prisma.payoutBatch.update({
        where: { id: batchId },
        data: {
          status: 'FAILED_STALE',
          errorMessage:
            'O processamento do lote parou inesperadamente (Worker Timeout).',
        },
      });
    }

    return batch;
  }
}

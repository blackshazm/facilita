import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { PayoutRepositoryPort, PayoutStatus } from '../../ports/payout-repository.port';
import { PayoutPort } from '../../ports/payout.port';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
@Processor('payout-execution')
export class ExecutePayoutProcessor extends WorkerHost {
  constructor(
    @Inject('PayoutRepositoryPort')
    private readonly payoutRepository: PayoutRepositoryPort,
    @Inject('PayoutPort')
    private readonly payoutPort: PayoutPort,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { payoutId, providerId, recipientId, amount } = job.data;

    const payout = await this.payoutRepository.findById(payoutId);
    if (!payout || payout.status !== PayoutStatus.PROCESSING) {
      return { status: 'skipped', reason: 'invalid_payout_state' };
    }

    try {
      const response = await this.payoutPort.transfer({
        providerId,
        recipientId,
        amount: BigInt(amount),
        idempotencyKey: payoutId,
      });

      payout.status = response.status === 'PAID' ? PayoutStatus.PAID : PayoutStatus.FAILED;
      payout.externalId = response.externalId;
      payout.fee = response.fee;
      payout.updatedAt = new Date();

      await this.payoutRepository.save(payout);

      if (payout.status === PayoutStatus.FAILED) {
        this.eventEmitter.emit('payout.failed', { payoutId, providerId, amount });
      }

      return { status: payout.status, externalId: response.externalId };
    } catch (error) {
      console.error(`Payout Execution Error [${payoutId}]:`, error);
      payout.status = PayoutStatus.FAILED;
      await this.payoutRepository.save(payout);
      this.eventEmitter.emit('payout.failed', { payoutId, providerId, amount });
      throw error;
    }
  }
}

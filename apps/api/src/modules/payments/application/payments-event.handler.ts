import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ProcessPayoutUseCase } from './process-payout.use-case';

@Injectable()
export class PaymentsEventHandler {
  private readonly logger = new Logger(PaymentsEventHandler.name);

  constructor(private readonly processPayoutUseCase: ProcessPayoutUseCase) {}

  @OnEvent('job.completed')
  async handleJobCompleted(payload: { jobId: string; providerId: string; payoutCents: number }) {
    this.logger.log(`Received job.completed event for Job ID: ${payload.jobId}`);
    
    await this.processPayoutUseCase.execute({
      jobId: payload.jobId,
      providerId: payload.providerId,
      payoutCents: payload.payoutCents,
    });
  }
}

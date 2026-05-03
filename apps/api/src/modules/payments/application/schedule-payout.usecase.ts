import { Inject, Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class SchedulePayoutUseCase {
  constructor(
    @InjectQueue('payouts') private payoutQueue: Queue,
  ) {}

  async execute(providerId: string, amount: number, tier: 'BRONZE' | 'PRATA' | 'OURO'): Promise<void> {
    // Delays in milliseconds
    const delays: Record<string, number> = {
      BRONZE: 15 * 24 * 60 * 60 * 1000, // 15 days
      PRATA: 7 * 24 * 60 * 60 * 1000,   // 7 days
      OURO: 2 * 24 * 60 * 60 * 1000,    // 2 days
    };

    const delay = delays[tier] || delays.BRONZE;

    await this.payoutQueue.add(
      'release-payout',
      { providerId, amount },
      { delay, jobId: `payout-${providerId}-${Date.now()}` }
    );
  }
}

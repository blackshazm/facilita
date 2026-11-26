import { Inject, Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class SchedulePayoutUseCase {
  constructor(
    @InjectQueue('payouts') private payoutQueue: Queue,
  ) { }

  /**
   * Agenda a liberação automática do saldo via Pix de acordo com o Tier do profissional
   * Resolução v4.1 (#35 & #112): Prazos canônicos de repasse:
   * Bronze: D+3 (3 dias)
   * Prata: D+2 (2 dias)
   * Ouro: D+1 (1 dia / 24h)
   */
  async execute(providerId: string, amount: number, tier: 'BRONZE' | 'PRATA' | 'OURO'): Promise<void> {
    // Delays in milliseconds
    const delays: Record<string, number> = {
      BRONZE: 3 * 24 * 60 * 60 * 1000, // D+3 (3 dias corridos)
      PRATA: 2 * 24 * 60 * 60 * 1000,  // D+2 (2 dias corridos)
      OURO: 1 * 24 * 60 * 60 * 1000,   // D+1 (1 dia / 24h)
    };

    const delay = delays[tier] || delays.BRONZE;

    await this.payoutQueue.add(
      'release-payout',
      { providerId, amount },
      { delay, jobId: `payout-${providerId}-${Date.now()}` }
    );
  }
}

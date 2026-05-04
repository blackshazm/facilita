import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class TieringSchedulerService implements OnModuleInit {
  constructor(@InjectQueue('tiering') private tieringQueue: Queue) {}

  async onModuleInit() {
    // Schedule daily job at 00:00
    await this.tieringQueue.add(
      'recalculate-tiers',
      {},
      {
        repeat: {
          pattern: '0 0 * * *',
        },
        removeOnComplete: true,
      }
    );
    console.log('[Tiering] Daily recalculation job scheduled (0 0 * * *)');
  }
}

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../../../shared-kernel/database/prisma.service';

@Processor('tiering')
@Injectable()
export class TierRecalculationProcessor extends WorkerHost {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const providers = await this.prisma.providerProfile.findMany({
      where: { isFlagged: false },
      include: { user: true }
    });

    for (const provider of providers) {
      const orderCount = await this.prisma.order.count({
        where: { providerId: provider.userId, status: 'DONE' }
      });

      let newTier = 'BRONZE';
      if (orderCount >= 50 && provider.rating >= 4.8) {
        newTier = 'OURO';
      } else if (orderCount >= 10 && provider.rating >= 4.5) {
        newTier = 'PRATA';
      }

      if (newTier !== provider.tier) {
        await this.prisma.providerProfile.update({
          where: { id: provider.id },
          data: { tier: newTier as any }
        });
        console.log(`[Tiering] Provider ${provider.userId} updated to ${newTier}`);
      }
    }

    return { processed: providers.length };
  }
}

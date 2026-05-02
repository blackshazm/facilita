import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../../shared-kernel/database/prisma.service';

@Injectable()
export class ProviderStatusListener {
  constructor(private readonly prisma: PrismaService) {}

  @OnEvent('provider.online')
  async handleProviderOnline(payload: { providerId: string }) {
    console.log(`Provider ${payload.providerId} is online. Syncing to matching schema...`);
    await this.prisma.activeProvider.upsert({
      where: { providerId: payload.providerId },
      update: { isOnline: true },
      create: { 
        providerId: payload.providerId, 
        isOnline: true,
        categoryId: 'placeholder-cat-id' // In a real app, this would come from the event or profile
      },
    });
  }

  @OnEvent('provider.offline')
  async handleProviderOffline(payload: { providerId: string }) {
    await this.prisma.activeProvider.update({
      where: { providerId: payload.providerId },
      data: { isOnline: false },
    });
  }
}

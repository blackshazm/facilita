import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../shared-kernel/database/prisma.service';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectQueue('notifications') private readonly notificationQueue: Queue,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent('payout.failed')
  async handlePayoutFailed(payload: { providerId: string; amount: string }) {
    // Find the userId for the provider
    const profile = await this.prisma.providerProfile.findUnique({
      where: { id: payload.providerId },
      select: { userId: true },
    });
    if (!profile) return;

    const amountFormatted = (Number(payload.amount) / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

    await this.sendToUser(
      profile.userId,
      '⚠️ Falha no Payout',
      `O valor de ${amountFormatted} voltou para sua Wallet. Atualize seus dados bancários.`,
      { type: 'PAYOUT_FAILED', amount: payload.amount },
    );
  }

  async sendToUser(userId: string, title: string, body: string, data?: any) {
    this.logger.log(`Agendando notificação para o usuário ${userId}: ${title}`);

    const devices = await this.prisma.userDevice.findMany({
      where: { userId },
    });

    if (devices.length === 0) {
      this.logger.warn(`Nenhum dispositivo encontrado para o usuário ${userId}`);
      return;
    }

    for (const device of devices) {
      // V2 Hardening: Rate Limiting e Retries configurados no job
      await this.notificationQueue.add(
        'send-push',
        {
          token: device.pushToken,
          title,
          body,
          data,
          userId,
        },
        {
          attempts: 5, // V2: Aumentado para 5 tentativas
          backoff: {
            type: 'exponential',
            delay: 2000, // Inicia com 2s
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
    }
  }

  async registerDevice(userId: string, pushToken: string, platform?: string, deviceId?: string) {
    return this.prisma.userDevice.upsert({
      where: { pushToken },
      update: {
        userId,
        platform,
        deviceId,
        lastLogin: new Date(),
      },
      create: {
        userId,
        pushToken,
        platform,
        deviceId,
      },
    });
  }
}

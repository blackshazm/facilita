import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../shared-kernel/database/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectQueue('notifications') private readonly notificationQueue: Queue,
    private readonly prisma: PrismaService,
  ) {}

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

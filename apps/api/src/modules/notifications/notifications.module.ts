import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationsService } from './notifications.service';
import { NotificationProcessor } from './infrastructure/queues/notification.processor';
import { PrismaService } from '../../shared-kernel/database/prisma.service';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notifications',
    }),
  ],
  providers: [NotificationsService, NotificationProcessor, PrismaService],
  exports: [NotificationsService],
})
export class NotificationsModule {}

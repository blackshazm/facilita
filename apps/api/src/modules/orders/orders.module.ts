import { Module } from '@nestjs/common';
import { PrismaService } from '../../shared-kernel/database/prisma.service';
import { ORDER_REPOSITORY_PORT } from './ports/order-repository.port';
import { PrismaOrderRepository } from './adapters/prisma-order-repository.adapter';

import { OrderController } from './interface/order.controller';
import { OrderService } from './application/order.service';
import { TrackingGateway } from './adapters/tracking.gateway';

import { CHAT_SERVICE_PORT } from './ports/chat-service.port';
import { StreamChatAdapter } from './infrastructure/stream-chat.adapter';
import { StreamChatWebhookController } from './infrastructure/stream-chat-webhook.controller';
import { ChatEventListener } from './infrastructure/chat-event.listener';

@Module({
  controllers: [OrderController, StreamChatWebhookController],
  providers: [
    PrismaService,
    OrderService,
    TrackingGateway,
    ChatEventListener,
    {
      provide: ORDER_REPOSITORY_PORT,
      useClass: PrismaOrderRepository,
    },
    {
      provide: CHAT_SERVICE_PORT,
      useClass: StreamChatAdapter,
    },
  ],
  exports: [ORDER_REPOSITORY_PORT, OrderService, TrackingGateway, CHAT_SERVICE_PORT],
})
export class OrdersModule {}

import { Module } from '@nestjs/common';
import { PrismaService } from '../../shared-kernel/database/prisma.service';
import { ORDER_REPOSITORY_PORT } from './ports/order-repository.port';
import { PrismaOrderRepository } from './adapters/prisma-order-repository.adapter';

import { OrderController } from './interface/order.controller';
import { OrderService } from './application/order.service';

@Module({
  controllers: [OrderController],
  providers: [
    PrismaService,
    OrderService,
    {
      provide: ORDER_REPOSITORY_PORT,
      useClass: PrismaOrderRepository,
    },
  ],
  exports: [ORDER_REPOSITORY_PORT, OrderService],
})
export class OrdersModule {}

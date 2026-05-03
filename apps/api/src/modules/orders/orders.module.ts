import { Module } from '@nestjs/common';
import { PrismaService } from '../../shared-kernel/database/prisma.service';
import { ORDER_REPOSITORY_PORT } from './ports/order-repository.port';
import { PrismaOrderRepository } from './adapters/prisma-order-repository.adapter';

@Module({
  providers: [
    PrismaService,
    {
      provide: ORDER_REPOSITORY_PORT,
      useClass: PrismaOrderRepository,
    },
  ],
  exports: [ORDER_REPOSITORY_PORT],
})
export class OrdersModule {}

import { Module } from '@nestjs/common';
import { PrismaService } from '../../shared-kernel/database/prisma.service';
import { PrismaWalletRepository } from './adapters/prisma-wallet-repository.adapter';
import { PrismaPaymentRepository } from './adapters/prisma-payment-repository.adapter';
import { PagarMeAdapter } from './infrastructure/gateways/pagarme.adapter';
import { BullModule } from '@nestjs/bullmq';
import { AuthorizePaymentUseCase } from './application/authorize-payment.usecase';
import { CapturePaymentUseCase } from './application/capture-payment.usecase';
import { SchedulePayoutUseCase } from './application/schedule-payout.usecase';
import { PayoutProcessor } from './infrastructure/queues/payout.processor';
import { OrderMatchedListener } from './infrastructure/listeners/order-matched.listener';
import { OrderDoneListener } from './infrastructure/listeners/order-done.listener';
import { PaymentWebhookController } from './interface/http/payment.webhook.controller';
import { OrdersModule } from '../orders/orders.module';
import { IdentityModule } from '../identity/identity.module';
import { PROVIDER_REPOSITORY_PORT } from '../identity/ports/provider-repository.port';

@Module({
  imports: [
    OrdersModule,
    IdentityModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'payouts',
    }),
  ],
  controllers: [PaymentWebhookController],
  providers: [
    PrismaService,
    AuthorizePaymentUseCase,
    CapturePaymentUseCase,
    SchedulePayoutUseCase,
    PayoutProcessor,
    OrderMatchedListener,
    OrderDoneListener,
    {
      provide: 'WalletRepositoryPort',
      useClass: PrismaWalletRepository,
    },
    {
      provide: 'PaymentRepositoryPort',
      useClass: PrismaPaymentRepository,
    },
    {
      provide: 'PaymentGatewayPort',
      useClass: PagarMeAdapter,
    },
  ],
  exports: ['WalletRepositoryPort', 'PaymentRepositoryPort'],
})
export class PaymentsModule {}

import { Module } from '@nestjs/common';
import { PrismaService } from '../../shared-kernel/database/prisma.service';
import { PrismaWalletRepository } from './adapters/prisma-wallet-repository.adapter';
import { PrismaPaymentRepository } from './adapters/prisma-payment-repository.adapter';
import { PrismaPayoutRepository } from './adapters/prisma-payout-repository.adapter';
import { PagarMeAdapter } from './infrastructure/gateways/pagarme.adapter';
import { PagarMePayoutAdapter } from './infrastructure/gateways/pagarme-payout.adapter';
import { BullModule } from '@nestjs/bullmq';
import { AuthorizePaymentUseCase } from './application/authorize-payment.usecase';
import { CapturePaymentUseCase } from './application/capture-payment.usecase';
import { SchedulePayoutUseCase } from './application/schedule-payout.usecase';
import { ProcessDailyPayoutsUseCase } from './application/process-daily-payouts.usecase';
import { ReverseFailedPayoutUseCase } from './application/reverse-failed-payout.usecase';
import { PayoutProcessor } from './infrastructure/queues/payout.processor';
import { ExecutePayoutProcessor } from './infrastructure/queues/execute-payout.processor';
import { OrderMatchedListener } from './infrastructure/listeners/order-matched.listener';
import { OrderDoneListener } from './infrastructure/listeners/order-done.listener';
import { PaymentWebhookController } from './interface/http/payment.webhook.controller';
import { BankDataController } from './interface/http/bank-data.controller';
import { OrdersModule } from '../orders/orders.module';
import { IdentityModule } from '../identity/identity.module';
import { PROVIDER_REPOSITORY_PORT } from '../identity/ports/provider-repository.port';
import { FiscalModule } from '../fiscal/fiscal.module';
import { SecurityService } from '../../shared-kernel/services/security.service';

@Module({
  imports: [
    OrdersModule,
    IdentityModule,
    FiscalModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    }),
    BullModule.registerQueue({ name: 'payouts' }),
    BullModule.registerQueue({ name: 'payout-execution' }),
  ],
  controllers: [PaymentWebhookController, BankDataController],
  providers: [
    PrismaService,
    SecurityService,
    AuthorizePaymentUseCase,
    CapturePaymentUseCase,
    SchedulePayoutUseCase,
    ProcessDailyPayoutsUseCase,
    ReverseFailedPayoutUseCase,
    PayoutProcessor,
    ExecutePayoutProcessor,
    OrderMatchedListener,
    OrderDoneListener,
    { provide: 'WalletRepositoryPort', useClass: PrismaWalletRepository },
    { provide: 'PaymentRepositoryPort', useClass: PrismaPaymentRepository },
    { provide: 'PayoutRepositoryPort', useClass: PrismaPayoutRepository },
    { provide: 'PaymentGatewayPort', useClass: PagarMeAdapter },
    { provide: 'PayoutPort', useClass: PagarMePayoutAdapter },
  ],
  exports: ['WalletRepositoryPort', 'PaymentRepositoryPort'],
})
export class PaymentsModule {}

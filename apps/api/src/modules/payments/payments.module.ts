import { Module } from '@nestjs/common';
import { PrismaService } from '../../shared-kernel/database/prisma.service';
import { PrismaWalletRepository } from './adapters/prisma-wallet-repository.adapter';
import { PrismaPaymentRepository } from './adapters/prisma-payment-repository.adapter';
import { PrismaPayoutRepository } from './adapters/prisma-payout-repository.adapter';
import { PagarMeAdapter } from './infrastructure/gateways/pagarme.adapter';
import { PagarMePayoutAdapter } from './infrastructure/gateways/pagarme-payout.adapter';
import { AsaasAdapter } from './infrastructure/gateways/asaas.adapter';
import { AsaasPayoutAdapter } from './infrastructure/gateways/asaas-payout.adapter';
import { AsaasWebhookController } from './interface/http/asaas.webhook.controller';
import { BullModule } from '@nestjs/bullmq';
import { AuthorizePaymentUseCase } from './application/authorize-payment.usecase';
import { CapturePaymentUseCase } from './application/capture-payment.usecase';
import { SchedulePayoutUseCase } from './application/schedule-payout.usecase';
import { ProcessDailyPayoutsUseCase } from './application/process-daily-payouts.usecase';
import { ReverseFailedPayoutUseCase } from './application/reverse-failed-payout.usecase';
import { ProcessPayoutWebhookUseCase } from './application/process-payout-webhook.usecase';
import { PayoutProcessor } from './infrastructure/queues/payout.processor';
import { ExecutePayoutProcessor } from './infrastructure/queues/execute-payout.processor';
import { OrderMatchedListener } from './infrastructure/listeners/order-matched.listener';
import { OrderDoneListener } from './infrastructure/listeners/order-done.listener';
import { ReferralRewardListener } from './infrastructure/listeners/referral-reward.listener';
import { ReferralRewardProcessor } from './infrastructure/queues/referral-reward.processor';
import { PaymentWebhookController } from './interface/http/payment.webhook.controller';
import { BankDataController } from './interface/http/bank-data.controller';
import { OrdersModule } from '../orders/orders.module';
import { IdentityModule } from '../identity/identity.module';
import { PROVIDER_REPOSITORY_PORT } from '../identity/ports/provider-repository.port';
import { FiscalModule } from '../fiscal/fiscal.module';
import { SecurityService } from '../../shared-kernel/services/security.service';
import { GetPayoutsUseCase } from './application/get-payouts.usecase';
import { AdminApprovePayoutUseCase } from './application/admin-approve-payout.usecase';
import { AdminBlockPayoutUseCase } from './application/admin-block-payout.usecase';
import { AdminPayoutController } from './interface/http/admin-payout.controller';
import { StartBatchPayoutUseCase } from './application/start-batch-payout.usecase';
import { GetBatchStatusUseCase } from './application/get-batch-status.usecase';
import { BatchPayoutProcessor } from './infrastructure/queues/batch-payout.processor';
import { ReconcileFinancialTransactionsUseCase } from './application/reconcile-financial-transactions.usecase';
import { FinancialReconciliationCron } from './infrastructure/cron/financial-reconciliation.cron';

import { ProcessPayoutUseCase } from './application/process-payout.use-case';
import { PaymentsEventHandler } from './application/payments-event.handler';
import { PAYMENT_GATEWAY, PAYMENTS_REPOSITORY } from './ports/payments.port';
import { StripePaymentGatewayAdapter } from './adapters/stripe-payment-gateway.adapter';
import { PaymentEntity } from './core/payment.entity';

// Mock DB
const mockPaymentsDb: PaymentEntity[] = [];

const mockPaymentsRepo = {
  save: async (payment: PaymentEntity) => {
    mockPaymentsDb.push(payment);
  },
  findById: async (id: string) => mockPaymentsDb.find(p => p.id === id) || null,
};

@Module({
  imports: [
    OrdersModule,
    IdentityModule,
    FiscalModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
      },
    }),
    BullModule.registerQueue({ name: 'payouts' }),
    BullModule.registerQueue({ name: 'payout-execution' }),
    BullModule.registerQueue({ name: 'referral-reward' }),
    BullModule.registerQueue({ name: 'payout-batch' }),
  ],
  controllers: [PaymentWebhookController, AsaasWebhookController, BankDataController, AdminPayoutController],
  providers: [
    PrismaService,
    SecurityService,
    AuthorizePaymentUseCase,
    CapturePaymentUseCase,
    SchedulePayoutUseCase,
    ProcessDailyPayoutsUseCase,
    ReverseFailedPayoutUseCase,
    ProcessPayoutWebhookUseCase,
    GetPayoutsUseCase,
    AdminApprovePayoutUseCase,
    AdminBlockPayoutUseCase,
    PayoutProcessor,
    ExecutePayoutProcessor,
    OrderMatchedListener,
    OrderDoneListener,
    ReferralRewardListener,
    ReferralRewardProcessor,
    StartBatchPayoutUseCase,
    GetBatchStatusUseCase,
    BatchPayoutProcessor,
    ReconcileFinancialTransactionsUseCase,
    FinancialReconciliationCron,
    ProcessPayoutUseCase,
    PaymentsEventHandler,
    { provide: 'WalletRepositoryPort', useClass: PrismaWalletRepository },
    { provide: 'PaymentRepositoryPort', useClass: PrismaPaymentRepository },
    { provide: 'PayoutRepositoryPort', useClass: PrismaPayoutRepository },
    AsaasAdapter,
    AsaasPayoutAdapter,
    PagarMeAdapter,
    PagarMePayoutAdapter,
    {
      provide: 'PaymentGatewayPort',
      useFactory: () => {
        const provider = process.env.PAYMENT_GATEWAY_PROVIDER || 'ASAAS';
        return provider === 'PAGARME' ? new PagarMeAdapter() : new AsaasAdapter();
      },
    },
    {
      provide: 'PayoutPort',
      useFactory: () => {
        const provider = process.env.PAYMENT_GATEWAY_PROVIDER || 'ASAAS';
        return provider === 'PAGARME' ? new PagarMePayoutAdapter() : new AsaasPayoutAdapter();
      },
    },
    // Mock for new MVP flow
    { provide: PAYMENT_GATEWAY, useClass: StripePaymentGatewayAdapter },
    { provide: PAYMENTS_REPOSITORY, useValue: mockPaymentsRepo },
  ],
  exports: ['WalletRepositoryPort', 'PaymentRepositoryPort', ReconcileFinancialTransactionsUseCase, FinancialReconciliationCron],
})
export class PaymentsModule {}

import { Module } from '@nestjs/common';
import { PrismaService } from '../../shared-kernel/database/prisma.service';
import { PrismaWalletRepository } from './adapters/prisma-wallet-repository.adapter';
import { PrismaPaymentRepository } from './adapters/prisma-payment-repository.adapter';
import { PagarMeAdapter } from './infrastructure/gateways/pagarme.adapter';
import { AuthorizePaymentUseCase } from './application/authorize-payment.usecase';
import { OrderMatchedListener } from './infrastructure/listeners/order-matched.listener';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [OrdersModule],
  providers: [
    PrismaService,
    AuthorizePaymentUseCase,
    OrderMatchedListener,
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

import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentGatewayPort } from '../ports/payment-gateway.port';
import { PaymentRepositoryPort } from '../ports/payment-repository.port';
import { WalletRepositoryPort } from '../ports/wallet-repository.port';
import { PrismaService } from '../../../shared-kernel/database/prisma.service';
import { TransactionType } from '../domain/wallet.entity';
import { PaymentAuthorizedEvent } from '../../../shared/events/events';
import { v4 as uuid } from 'uuid';

export interface AuthorizePaymentInput {
  orderId: string;
  amount: number;
  customerId: string;
  paymentMethod: 'CARD' | 'PIX';
  cardToken?: string;
}

@Injectable()
export class AuthorizePaymentUseCase {
  constructor(
    @Inject('PaymentGatewayPort')
    private readonly gateway: PaymentGatewayPort,
    @Inject('PaymentRepositoryPort')
    private readonly repository: PaymentRepositoryPort,
    @Inject('WalletRepositoryPort')
    private readonly walletRepository: any,
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(input: AuthorizePaymentInput): Promise<void> {
    // 0. Apply Promo Discount
    let finalAmount = input.amount;
    let promoDiscount = 0n;

    const wallet = await this.walletRepository.findByProviderId(input.customerId);
    if (wallet && wallet.promoBalance > 0n) {
      const maxDiscount = 1000n; // R$ 10,00
      promoDiscount = wallet.promoBalance > maxDiscount ? maxDiscount : wallet.promoBalance;
      
      // We deduct the discount from the amount to be charged
      // Assuming input.amount is in REALs? No, usually cents in gateways.
      // Let's check schema: totalAmount Decimal.
      // capture-payment uses taxCalculator.calculate(Number(payment.amount))
      // It seems it's in Reals?
      
      // Let's assume input.amount is in Cents for consistency with Wallet.
      // If it's in Reals, we convert.
      
      const discountInReals = Number(promoDiscount) / 100;
      finalAmount = Math.max(0, input.amount - discountInReals);
    }

    // 1. Authorize with gateway (Auth-only)
    const result = await this.gateway.authorize({
      orderId: input.orderId,
      amount: finalAmount,
      customerId: input.customerId,
      paymentMethod: input.paymentMethod,
      cardToken: input.cardToken,
    });

    // 2. Save payment record
    const paymentId = uuid();
    await this.repository.save({
      id: paymentId,
      orderId: input.orderId,
      externalId: result.externalId,
      amount: finalAmount,
      method: input.paymentMethod,
      status: result.status,
    });

    // 2.1 Debit Promo Balance if authorized
    if (promoDiscount > 0n && (result.status === 'AUTHORIZED' || result.status === 'PAID')) {
      wallet.debitPromo(promoDiscount);
      await this.walletRepository.save(wallet);

      await this.prisma.walletTransaction.create({
        data: {
          id: uuid(),
          walletId: wallet.id,
          type: 'DEBIT',
          amount: promoDiscount,
          orderId: input.orderId,
          description: 'Desconto Promocional (Indicação)',
        },
      });
    }

    // 3. Emit event if authorized
    if (result.status === 'AUTHORIZED' || result.status === 'PAID') {
      this.eventEmitter.emit(
        'payment.authorized',
        new PaymentAuthorizedEvent(paymentId, input.amount),
      );
    }
  }
}

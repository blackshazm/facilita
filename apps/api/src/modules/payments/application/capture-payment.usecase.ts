import { Inject, Injectable } from '@nestjs/common';
import { PaymentGatewayPort } from '../ports/payment-gateway.port';
import { PaymentRepositoryPort } from '../ports/payment-repository.port';
import { WalletRepositoryPort } from '../ports/wallet-repository.port';
import { Wallet } from '../domain/wallet.entity';
import { SchedulePayoutUseCase } from './schedule-payout.usecase';
import { PROVIDER_REPOSITORY_PORT, ProviderRepositoryPort } from '../../identity/ports/provider-repository.port';
import { TaxCalculatorService } from '../../fiscal/application/tax-calculator.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FinancialAuditService } from '../../../shared-kernel/services/financial-audit.service';

@Injectable()
export class CapturePaymentUseCase {
  constructor(
    @Inject('PaymentGatewayPort')
    private readonly gateway: PaymentGatewayPort,
    @Inject('PaymentRepositoryPort')
    private readonly paymentRepository: PaymentRepositoryPort,
    @Inject('WalletRepositoryPort')
    private readonly walletRepository: WalletRepositoryPort,
    @Inject(PROVIDER_REPOSITORY_PORT)
    private readonly providerRepository: ProviderRepositoryPort,
    private readonly schedulePayout: SchedulePayoutUseCase,
    private readonly taxCalculator: TaxCalculatorService,
    private readonly eventEmitter: EventEmitter2,
    private readonly auditService: FinancialAuditService,
  ) {}

  async execute(orderId: string, providerId: string): Promise<void> {
    // 1. Find payment
    const payment = await this.paymentRepository.findByOrderId(orderId);
    if (!payment || (payment.status !== 'AUTHORIZED' && payment.status !== 'PENDING') || !payment.externalId) {
      throw new Error('Payment not found or not in valid state for capture');
    }

    // 2. Capture with gateway
    await this.gateway.capture(payment.externalId);
    
    // 3. Calculate taxes and split
    const taxResult = this.taxCalculator.calculate(Number(payment.amount));

    // 4. Update payment status and split
    const updatedPayment = {
      ...payment,
      status: 'PAID' as const,
      splitAmount: taxResult.providerShare,
      ibsAmount: taxResult.ibsAmount,
      cbsAmount: taxResult.cbsAmount,
    };
    await this.paymentRepository.save(updatedPayment);

    // 5. Audit Log (Imutável)
    await this.auditService.log({
      actorId: 'SYSTEM',
      actorType: 'SYSTEM',
      action: 'PAYMENT_CAPTURED',
      entityType: 'Payment',
      entityId: payment.id,
      before: payment,
      after: updatedPayment,
      metadata: { orderId, providerId, taxResult },
    });

    // 5. Update Wallet (Ledger Entry)
    let wallet = await this.walletRepository.findByProviderId(providerId);
    if (!wallet) {
      wallet = new Wallet({
        id: require('uuid').v4(),
        providerId,
        balance: 0n,
        pendingBalance: 0n,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    const providerShareBigInt = BigInt(taxResult.providerShare);
    wallet.freeze(providerShareBigInt);
    await this.walletRepository.save(wallet);

    // 6. Schedule payout release based on tier
    const provider = await this.providerRepository.findById(providerId);
    if (provider) {
      await this.schedulePayout.execute(providerId, taxResult.providerShare, provider.tier);
    }

    // 7. Emit event for Fiscal and Analytics
    this.eventEmitter.emit('payment.captured', {
      orderId,
      paymentId: payment.id,
      amount: Number(payment.amount),
      splitAmount: taxResult.providerShare,
      marketplaceFee: taxResult.marketplaceFee,
      ibsAmount: taxResult.ibsAmount,
      cbsAmount: taxResult.cbsAmount,
      providerId,
    });
  }
}

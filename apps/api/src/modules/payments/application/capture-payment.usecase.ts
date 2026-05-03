import { Inject, Injectable } from '@nestjs/common';
import { PaymentGatewayPort } from '../ports/payment-gateway.port';
import { PaymentRepositoryPort } from '../ports/payment-repository.port';
import { WalletRepositoryPort } from '../ports/wallet-repository.port';
import { Wallet } from '../domain/wallet.entity';
import { SchedulePayoutUseCase } from './schedule-payout.usecase';
import { PROVIDER_REPOSITORY_PORT, ProviderRepositoryPort } from '../../identity/ports/provider-repository.port';

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
  ) {}

  async execute(orderId: string, providerId: string): Promise<void> {
    // 1. Find payment
    const payment = await this.paymentRepository.findByOrderId(orderId);
    if (!payment || (payment.status !== 'AUTHORIZED' && payment.status !== 'PENDING') || !payment.externalId) {
      throw new Error('Payment not found or not in valid state for capture');
    }

    // 2. Capture with gateway
    await this.gateway.capture(payment.externalId);
    
    // 3. Update payment status
    await this.paymentRepository.save({
      ...payment,
      status: 'PAID',
      splitAmount: Math.floor(payment.amount * 0.8), // 80% split for provider
    });

    // 4. Update Wallet (Ledger Entry)
    let wallet = await this.walletRepository.findByProviderId(providerId);
    if (!wallet) {
      // Create wallet if not exists
      wallet = new Wallet({
        id: require('uuid').v4(),
        providerId,
        balance: 0n,
        pendingBalance: 0n,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    const providerShare = BigInt(Math.floor(payment.amount * 0.8));
    wallet.freeze(providerShare); // Moves to pending balance first
    await this.walletRepository.save(wallet);

    // 5. Schedule payout release based on tier
    const provider = await this.providerRepository.findById(providerId);
    if (provider) {
      await this.schedulePayout.execute(providerId, Number(providerShare), provider.tier);
    }
  }
}

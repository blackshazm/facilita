import { Inject, Injectable } from '@nestjs/common';
import { WalletRepositoryPort } from '../ports/wallet-repository.port';
import { PayoutRepositoryPort, PayoutStatus } from '../ports/payout-repository.port';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class ReverseFailedPayoutUseCase {
  constructor(
    @Inject('WalletRepositoryPort')
    private readonly walletRepository: WalletRepositoryPort,
    @Inject('PayoutRepositoryPort')
    private readonly payoutRepository: PayoutRepositoryPort,
  ) {}

  @OnEvent('payout.failed')
  async handle(payload: { payoutId: string; providerId: string; amount: string }): Promise<void> {
    const { payoutId, providerId, amount } = payload;
    
    const wallet = await this.walletRepository.findByProviderId(providerId);
    if (!wallet) throw new Error(`Wallet not found for provider ${providerId}`);

    // Credits back the amount to available balance
    wallet.credit(BigInt(amount));
    await this.walletRepository.save(wallet);

    // Update payout log if not already failed
    const payout = await this.payoutRepository.findById(payoutId);
    if (payout && payout.status !== PayoutStatus.FAILED) {
      payout.status = PayoutStatus.FAILED;
      payout.updatedAt = new Date();
      await this.payoutRepository.save(payout);
    }
    
    // Note: Push notification is handled by the Notifications module listening to 'payout.failed'
  }
}

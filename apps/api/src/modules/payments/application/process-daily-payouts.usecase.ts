import { Inject, Injectable } from '@nestjs/common';
import { WalletRepositoryPort } from '../ports/wallet-repository.port';
import { PayoutRepositoryPort, PayoutStatus } from '../ports/payout-repository.port';
import { PROVIDER_REPOSITORY_PORT, ProviderRepositoryPort } from '../../identity/ports/provider-repository.port';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProcessDailyPayoutsUseCase {
  constructor(
    @Inject('WalletRepositoryPort')
    private readonly walletRepository: WalletRepositoryPort,
    @Inject('PayoutRepositoryPort')
    private readonly payoutRepository: PayoutRepositoryPort,
    @Inject(PROVIDER_REPOSITORY_PORT)
    private readonly providerRepository: ProviderRepositoryPort,
    @InjectQueue('payout-execution') private payoutQueue: Queue,
  ) {}

  async execute(): Promise<{ processed: number; skipped: number }> {
    const wallets = await this.walletRepository.findWalletsWithBalance();
    let processed = 0;
    let skipped = 0;

    for (const wallet of wallets) {
      const provider = await this.providerRepository.findById(wallet.providerId);
      if (!provider) {
        skipped++;
        continue;
      }

      // Guard: KYC must be approved
      if (provider.kycStatus !== 'APPROVED') {
        skipped++;
        continue;
      }

      // Security: Change Lock (24h)
      if (provider.bankDataUpdatedAt) {
        const hoursSinceUpdate = (Date.now() - provider.bankDataUpdatedAt.getTime()) / (1000 * 60 * 60);
        if (hoursSinceUpdate < 24) {
          skipped++;
          continue;
        }
      }

      // Check for recipient ID
      if (!provider.pagarmeRecipientId) {
        skipped++;
        continue;
      }

      const amount = wallet.balance;
      const threshold = 200000n; // R$ 2.000,00

      const payoutId = uuidv4();
      const status = amount > threshold ? PayoutStatus.PENDING_APPROVAL : PayoutStatus.PROCESSING;

      // Atomic debit
      wallet.registerPayout(amount);
      await this.walletRepository.save(wallet);

      await this.payoutRepository.save({
        id: payoutId,
        providerId: wallet.providerId,
        amount,
        fee: 0n,
        status,
        bankDataHash: provider.bankDataHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      if (status === PayoutStatus.PROCESSING) {
        await this.payoutQueue.add('execute-bank-transfer', {
          payoutId,
          providerId: wallet.providerId,
          recipientId: provider.pagarmeRecipientId,
          amount: amount.toString(),
        });
      }

      processed++;
    }

    return { processed, skipped };
  }
}

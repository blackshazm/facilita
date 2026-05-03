import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { WalletRepositoryPort } from '../../ports/wallet-repository.port';

@Processor('payouts')
@Injectable()
export class PayoutProcessor extends WorkerHost {
  constructor(
    @Inject('WalletRepositoryPort')
    private readonly walletRepository: WalletRepositoryPort,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { providerId, amount } = job.data;
    
    const wallet = await this.walletRepository.findByProviderId(providerId);
    if (!wallet) throw new Error('Wallet not found');

    wallet.release(BigInt(amount));
    await this.walletRepository.save(wallet);

    return { status: 'payout_released', providerId, amount };
  }
}

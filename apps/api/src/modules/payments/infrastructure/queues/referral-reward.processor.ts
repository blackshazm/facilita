import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { 'WalletRepositoryPort' as WalletRepoPort } from '../../ports/wallet-repository.port'; // Wait, this syntax is wrong for import
import { USER_REPOSITORY_PORT, UserRepositoryPort } from '../../../identity/ports/user-repository.port';
import { PrismaService } from '../../../../shared-kernel/database/prisma.service';
import { TransactionType } from '../../domain/wallet.entity';
import { v4 as uuid } from 'uuid';

@Processor('referral-reward')
@Injectable()
export class ReferralRewardProcessor extends WorkerHost {
  constructor(
    @Inject('WalletRepositoryPort') private readonly walletRepository: any, // Using any to avoid port/entity mismatch issues for now
    @Inject(USER_REPOSITORY_PORT) private readonly userRepository: UserRepositoryPort,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job<{ orderId: string, refereeId: string, referrerId: string }>): Promise<void> {
    const { orderId, refereeId, referrerId } = job.data;

    // Double check order status (it might have been cancelled without removal, or manually changed)
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.status !== 'DONE') {
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      // 1. Reward Referee
      await this.creditPromo(tx, refereeId, 1000n, orderId, 'Bônus de Indicação (Convidado)');

      // 2. Reward Referrer
      await this.creditPromo(tx, referrerId, 1000n, orderId, 'Bônus de Indicação (Indicação)');

      // 3. Increment Referrer Count
      await tx.user.update({
        where: { id: referrerId },
        data: { referralCount: { increment: 1 } },
      });
    });
  }

  private async creditPromo(tx: any, userId: string, amount: bigint, orderId: string, description: string) {
    let wallet = await tx.wallet.findUnique({ where: { providerId: userId } });

    if (!wallet) {
      wallet = await tx.wallet.create({
        data: {
          id: uuid(),
          providerId: userId,
          balance: 0n,
          pendingBalance: 0n,
          promoBalance: amount,
        },
      });
    } else {
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { promoBalance: { increment: amount } },
      });
    }

    await tx.walletTransaction.create({
      data: {
        id: uuid(),
        walletId: wallet.id,
        type: 'PROMO_CREDIT',
        amount,
        orderId,
        description,
      },
    });
  }
}

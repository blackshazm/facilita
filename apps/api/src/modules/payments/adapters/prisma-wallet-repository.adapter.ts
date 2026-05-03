import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared-kernel/database/prisma.service';
import { Wallet } from '../domain/wallet.entity';
import { WalletRepositoryPort } from '../ports/wallet-repository.port';

@Injectable()
export class PrismaWalletRepository implements WalletRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(wallet: Wallet): Promise<void> {
    const data = wallet.toJSON();
    await this.prisma.wallet.upsert({
      where: { id: wallet.id },
      update: {
        balance: BigInt(data.balance),
        pendingBalance: BigInt(data.pendingBalance),
        updatedAt: new Date(),
      },
      create: {
        id: data.id,
        providerId: data.providerId,
        balance: BigInt(data.balance),
        pendingBalance: BigInt(data.pendingBalance),
      },
    });
  }

  async findByProviderId(providerId: string): Promise<Wallet | null> {
    const raw = await this.prisma.wallet.findUnique({
      where: { providerId },
    });
    if (!raw) return null;
    return this.mapToDomain(raw);
  }

  async findById(id: string): Promise<Wallet | null> {
    const raw = await this.prisma.wallet.findUnique({
      where: { id },
    });
    if (!raw) return null;
    return this.mapToDomain(raw);
  }

  private mapToDomain(raw: any): Wallet {
    return new Wallet({
      id: raw.id,
      providerId: raw.providerId,
      balance: BigInt(raw.balance),
      pendingBalance: BigInt(raw.pendingBalance),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared-kernel/database/prisma.service';
import { PayoutRepositoryPort, PayoutProps, PayoutStatus } from '../ports/payout-repository.port';

@Injectable()
export class PrismaPayoutRepository implements PayoutRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(payout: PayoutProps): Promise<void> {
    await this.prisma.payout.upsert({
      where: { id: payout.id },
      update: {
        status: payout.status as any,
        externalId: payout.externalId,
        fee: payout.fee,
        bankDataHash: payout.bankDataHash,
        metadata: payout.metadata,
        updatedAt: new Date(),
      },
      create: {
        id: payout.id,
        providerId: payout.providerId,
        amount: payout.amount,
        fee: payout.fee,
        status: payout.status as any,
        externalId: payout.externalId,
        bankDataHash: payout.bankDataHash,
        metadata: payout.metadata,
      },
    });
  }

  async findById(id: string): Promise<PayoutProps | null> {
    const raw = await this.prisma.payout.findUnique({ where: { id } });
    if (!raw) return null;
    return {
      id: raw.id,
      providerId: raw.providerId,
      amount: raw.amount,
      fee: raw.fee,
      status: raw.status as PayoutStatus,
      externalId: raw.externalId || undefined,
      bankDataHash: raw.bankDataHash || undefined,
      metadata: raw.metadata,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  async findByStatus(status: PayoutStatus): Promise<PayoutProps[]> {
    const raws = await this.prisma.payout.findMany({
      where: { status: status as any },
    });
    return raws.map(this.toProps);
  }

  async find(params: { status?: PayoutStatus; skip?: number; take?: number }): Promise<{ items: PayoutProps[]; total: number }> {
    const where = params.status ? { status: params.status as any } : {};
    const [items, total] = await Promise.all([
      this.prisma.payout.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payout.count({ where }),
    ]);

    return {
      items: items.map(this.toProps),
      total,
    };
  }

  private toProps(raw: any): PayoutProps {
    return {
      id: raw.id,
      providerId: raw.providerId,
      amount: raw.amount,
      fee: raw.fee,
      status: raw.status as PayoutStatus,
      externalId: raw.externalId || undefined,
      bankDataHash: raw.bankDataHash || undefined,
      metadata: raw.metadata,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}

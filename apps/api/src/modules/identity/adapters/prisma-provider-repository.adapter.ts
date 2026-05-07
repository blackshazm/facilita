import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared-kernel/database/prisma.service';
import { ProviderProfileProps, ProviderRepositoryPort } from '../ports/provider-repository.port';

@Injectable()
export class PrismaProviderRepository implements ProviderRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<ProviderProfileProps | null> {
    const raw = await this.prisma.providerProfile.findUnique({
      where: { id },
      include: { 
        user: { include: { kycSubmissions: { orderBy: { createdAt: 'desc' }, take: 1 } } },
        serviceZones: true
      },
    });
    if (!raw) return null;
    return {
      id: raw.id,
      userId: raw.userId,
      tier: raw.tier as any,
      pagarmeRecipientId: raw.pagarmeRecipientId || undefined,
      bankCode: raw.bankCode || undefined,
      bankBranch: raw.bankBranch || undefined,
      bankBranchDigit: raw.bankBranchDigit || undefined,
      bankAccount: raw.bankAccount || undefined,
      bankAccountDigit: raw.bankAccountDigit || undefined,
      bankAccountType: raw.bankAccountType || undefined,
      bankDataHash: raw.bankDataHash || undefined,
      bankDataUpdatedAt: raw.bankDataUpdatedAt || undefined,
      kycStatus: (raw.user?.kycSubmissions?.[0]?.status as any) || 'PENDING',
      serviceZoneIds: (raw as any).serviceZones?.map((z: any) => z.id) || [],
    };
  }

  async save(provider: ProviderProfileProps): Promise<void> {
    await this.prisma.providerProfile.update({
      where: { id: provider.id },
      data: {
        tier: provider.tier as any,
        pagarmeRecipientId: provider.pagarmeRecipientId,
        bankCode: provider.bankCode,
        bankBranch: provider.bankBranch,
        bankBranchDigit: provider.bankBranchDigit,
        bankAccount: provider.bankAccount,
        bankAccountDigit: provider.bankAccountDigit,
        bankAccountType: provider.bankAccountType,
        bankDataHash: provider.bankDataHash,
        bankDataUpdatedAt: provider.bankDataUpdatedAt,
        ...(provider.serviceZoneIds !== undefined && {
          serviceZones: {
            set: provider.serviceZoneIds.map((id) => ({ id })),
          },
        }),
      },
    });
  }
}

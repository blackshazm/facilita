import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared-kernel/database/prisma.service';
import { ProviderProfileProps, ProviderRepositoryPort } from '../ports/provider-repository.port';

@Injectable()
export class PrismaProviderRepository implements ProviderRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<ProviderProfileProps | null> {
    const raw = await this.prisma.providerProfile.findUnique({
      where: { id },
    });
    if (!raw) return null;
    return {
      id: raw.id,
      userId: raw.userId,
      tier: raw.tier as any,
      pagarmeRecipientId: raw.pagarmeRecipientId || undefined,
    };
  }

  async save(provider: ProviderProfileProps): Promise<void> {
    await this.prisma.providerProfile.update({
      where: { id: provider.id },
      data: {
        tier: provider.tier as any,
        pagarmeRecipientId: provider.pagarmeRecipientId,
      },
    });
  }
}

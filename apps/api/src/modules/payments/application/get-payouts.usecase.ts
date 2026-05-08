import { Inject, Injectable } from '@nestjs/common';
import { PayoutRepositoryPort, PayoutStatus, PayoutProps } from '../ports/payout-repository.port';
import { PROVIDER_REPOSITORY_PORT, ProviderRepositoryPort } from '../../identity/ports/provider-repository.port';

@Injectable()
export class GetPayoutsUseCase {
  constructor(
    @Inject('PayoutRepositoryPort')
    private readonly payoutRepository: PayoutRepositoryPort,
    @Inject(PROVIDER_REPOSITORY_PORT)
    private readonly providerRepository: ProviderRepositoryPort,
  ) {}

  async execute(params: { status?: PayoutStatus; page?: number; limit?: number }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const { items, total } = await this.payoutRepository.find({
      status: params.status,
      skip,
      take: limit,
    });

    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const provider = await this.providerRepository.findById(item.providerId);
        return {
          ...item,
          amount: item.amount.toString(),
          fee: item.fee.toString(),
          providerName: provider?.userId || 'Desconhecido', // Normally we'd get name from User table, using userId as fallback
          maskedBankData: provider ? this.maskBankData(provider) : 'N/A',
        };
      }),
    );

    return {
      items: enrichedItems,
      total,
      page,
      limit,
    };
  }

  private maskBankData(provider: any): string {
    if (!provider.bankAccount) return 'N/A';
    const acc = provider.bankAccount;
    const masked = '*'.repeat(acc.length - 4) + acc.slice(-4);
    return `${provider.bankCode || '???'} - Ag: ${provider.bankBranch || '????'} - Conta: ${masked}${provider.bankAccountDigit ? '-' + provider.bankAccountDigit : ''}`;
  }
}

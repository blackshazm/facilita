export interface ProviderProfileProps {
  id: string;
  userId: string;
  tier: 'BRONZE' | 'PRATA' | 'OURO';
  pagarmeRecipientId?: string;
  bankCode?: string;
  bankBranch?: string;
  bankBranchDigit?: string;
  bankAccount?: string;
  bankAccountDigit?: string;
  bankAccountType?: string;
  bankDataHash?: string;
  bankDataUpdatedAt?: Date;
  kycStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface ProviderRepositoryPort {
  findById(id: string): Promise<ProviderProfileProps | null>;
  save(provider: ProviderProfileProps): Promise<void>;
}

export const PROVIDER_REPOSITORY_PORT = Symbol('ProviderRepositoryPort');

import { Wallet } from '../domain/wallet.entity';

export interface WalletRepositoryPort {
  save(wallet: Wallet): Promise<void>;
  findByProviderId(providerId: string): Promise<Wallet | null>;
  findById(id: string): Promise<Wallet | null>;
  findWalletsWithBalance(): Promise<Wallet[]>;
}

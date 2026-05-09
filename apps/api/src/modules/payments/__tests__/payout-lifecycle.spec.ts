import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ProcessDailyPayoutsUseCase } from '../application/process-daily-payouts.usecase';
import { WalletRepositoryPort } from '../ports/wallet-repository.port';
import { PayoutRepositoryPort, PayoutStatus } from '../ports/payout-repository.port';
import { PROVIDER_REPOSITORY_PORT } from '../../identity/ports/provider-repository.port';
import { Wallet } from '../domain/wallet.entity';
import { getQueueToken } from '@nestjs/bullmq';

describe('Payout Lifecycle', () => {
  let useCase: ProcessDailyPayoutsUseCase;
  let walletRepo: any;
  let payoutRepo: any;
  let providerRepo: any;
  let queue: any;

  beforeEach(async () => {
    walletRepo = {
      findWalletsWithBalance: jest.fn(),
      save: jest.fn(),
    };
    payoutRepo = {
      save: jest.fn(),
    };
    providerRepo = {
      findById: jest.fn(),
    };
    queue = {
      add: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessDailyPayoutsUseCase,
        { provide: 'WalletRepositoryPort', useValue: walletRepo },
        { provide: 'PayoutRepositoryPort', useValue: payoutRepo },
        { provide: PROVIDER_REPOSITORY_PORT, useValue: providerRepo },
        { provide: getQueueToken('payout-execution'), useValue: queue },
      ],
    }).compile();

    useCase = module.get<ProcessDailyPayoutsUseCase>(ProcessDailyPayoutsUseCase);
  });

  it('should process a standard payout (< 2k)', async () => {
    const wallet = new Wallet({
      id: 'w1',
      providerId: 'p1',
      balance: 100000n, // R$ 1.000,00
      pendingBalance: 0n,
      promoBalance: 0n,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    walletRepo.findWalletsWithBalance.mockResolvedValue([wallet]);
    providerRepo.findById.mockResolvedValue({
      id: 'p1',
      pagarmeRecipientId: 're_123',
      kycStatus: 'APPROVED',
      bankDataUpdatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 48h ago
    });

    const result = await useCase.execute();

    expect(result.processed).toBe(1);
    expect(wallet.balance).toBe(0n);
    expect(payoutRepo.save).toHaveBeenCalledWith(expect.objectContaining({
      status: PayoutStatus.PROCESSING,
      amount: 100000n,
    }));
    expect(queue.add).toHaveBeenCalled();
  });

  it('should skip payout if bank data was updated < 24h ago', async () => {
    const wallet = new Wallet({
      id: 'w1',
      providerId: 'p1',
      balance: 100000n,
      pendingBalance: 0n,
      promoBalance: 0n,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    walletRepo.findWalletsWithBalance.mockResolvedValue([wallet]);
    providerRepo.findById.mockResolvedValue({
      id: 'p1',
      pagarmeRecipientId: 're_123',
      kycStatus: 'APPROVED',
      bankDataUpdatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
    });

    const result = await useCase.execute();

    expect(result.processed).toBe(0);
    expect(result.skipped).toBe(1);
    expect(wallet.balance).toBe(100000n); // Not debited
  });

  it('should hold payout for approval if > 2k', async () => {
    const wallet = new Wallet({
      id: 'w1',
      providerId: 'p1',
      balance: 300000n, // R$ 3.000,00
      pendingBalance: 0n,
      promoBalance: 0n,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    walletRepo.findWalletsWithBalance.mockResolvedValue([wallet]);
    providerRepo.findById.mockResolvedValue({
      id: 'p1',
      pagarmeRecipientId: 're_123',
      kycStatus: 'APPROVED',
      bankDataUpdatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    });

    const result = await useCase.execute();

    expect(result.processed).toBe(1);
    expect(payoutRepo.save).toHaveBeenCalledWith(expect.objectContaining({
      status: PayoutStatus.PENDING_APPROVAL,
    }));
    expect(queue.add).not.toHaveBeenCalled(); // Should not dispatch to queue yet
  });
});

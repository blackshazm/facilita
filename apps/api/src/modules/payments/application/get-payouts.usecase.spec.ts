import { Test, TestingModule } from '@nestjs/testing';
import { GetPayoutsUseCase } from './get-payouts.usecase';
import { PROVIDER_REPOSITORY_PORT } from '../../identity/ports/provider-repository.port';
import { PayoutStatus } from '../ports/payout-repository.port';

describe('GetPayoutsUseCase', () => {
  let useCase: GetPayoutsUseCase;
  let payoutRepo: any;
  let providerRepo: any;

  beforeEach(async () => {
    payoutRepo = {
      find: jest.fn(),
    };
    providerRepo = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPayoutsUseCase,
        { provide: 'PayoutRepositoryPort', useValue: payoutRepo },
        { provide: PROVIDER_REPOSITORY_PORT, useValue: providerRepo },
      ],
    }).compile();

    useCase = module.get<GetPayoutsUseCase>(GetPayoutsUseCase);
  });

  it('should fetch and enrich payouts correctly', async () => {
    payoutRepo.find.mockResolvedValue({
      items: [
        { id: 'pout-1', providerId: 'prov-1', amount: 10000n, fee: 1500n, status: PayoutStatus.PENDING },
      ],
      total: 1,
    });
    providerRepo.findById.mockResolvedValue({
      userId: 'Jane Doe',
      bankCode: '033',
      bankBranch: '1234',
      bankAccount: '12345678',
      bankAccountDigit: '9',
    });

    const result = await useCase.execute({ page: 1, limit: 10 });

    expect(payoutRepo.find).toHaveBeenCalledWith({
      status: undefined,
      skip: 0,
      take: 10,
    });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].amount).toBe('10000');
    expect(result.items[0].fee).toBe('1500');
    expect(result.items[0].providerName).toBe('Jane Doe');
    expect(result.items[0].maskedBankData).toBe('033 - Ag: 1234 - Conta: ****5678-9');
  });

  it('should fallback properly if provider is not found', async () => {
    payoutRepo.find.mockResolvedValue({
      items: [
        { id: 'pout-2', providerId: 'prov-unknown', amount: 5000n, fee: 500n, status: PayoutStatus.PENDING },
      ],
      total: 1,
    });
    providerRepo.findById.mockResolvedValue(null);

    const result = await useCase.execute({});

    expect(result.items[0].providerName).toBe('Desconhecido');
    expect(result.items[0].maskedBankData).toBe('N/A');
  });
});

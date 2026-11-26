import { Test, TestingModule } from '@nestjs/testing';
import { BankDataController } from './bank-data.controller';
import { PROVIDER_REPOSITORY_PORT } from '../../../identity/ports/provider-repository.port';
import { SecurityService } from '../../../../shared-kernel/services/security.service';

describe('BankDataController', () => {
  let provider: BankDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BankDataController,
        {
          provide: PROVIDER_REPOSITORY_PORT,
          useValue: { findById: jest.fn(), save: jest.fn() },
        },
        {
          provide: SecurityService,
          useValue: { encrypt: jest.fn(), decrypt: jest.fn(), hash: jest.fn() },
        },
      ],
    }).compile();

    provider = module.get<BankDataController>(BankDataController);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

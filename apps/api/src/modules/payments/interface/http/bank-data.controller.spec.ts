import { Test, TestingModule } from '@nestjs/testing';
import { BankDataController } from './bank-data.controller';

describe('BankDataController', () => {
  let provider: BankDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BankDataController,
        // TODO: Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<BankDataController>(BankDataController);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

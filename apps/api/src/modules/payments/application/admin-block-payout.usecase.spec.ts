import { Test, TestingModule } from '@nestjs/testing';
import { AdminBlockPayoutUseCase } from './admin-block-payout.usecase';

describe('AdminBlockPayoutUseCase', () => {
  let provider: AdminBlockPayoutUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminBlockPayoutUseCase,
        // TODO: Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<AdminBlockPayoutUseCase>(AdminBlockPayoutUseCase);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

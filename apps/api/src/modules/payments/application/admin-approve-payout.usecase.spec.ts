import { Test, TestingModule } from '@nestjs/testing';
import { AdminApprovePayoutUseCase } from './admin-approve-payout.usecase';

describe('AdminApprovePayoutUseCase', () => {
  let provider: AdminApprovePayoutUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminApprovePayoutUseCase,
        // TODO: Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<AdminApprovePayoutUseCase>(AdminApprovePayoutUseCase);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

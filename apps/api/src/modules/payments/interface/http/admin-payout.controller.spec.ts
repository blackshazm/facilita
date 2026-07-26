import { Test, TestingModule } from '@nestjs/testing';
import { AdminPayoutController } from './admin-payout.controller';

describe('AdminPayoutController', () => {
  let provider: AdminPayoutController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminPayoutController,
        // TODO: Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<AdminPayoutController>(AdminPayoutController);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

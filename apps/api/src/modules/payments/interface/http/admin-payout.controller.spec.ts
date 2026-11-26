import { Test, TestingModule } from '@nestjs/testing';
import { AdminPayoutController } from './admin-payout.controller';
import { GetPayoutsUseCase } from '../../application/get-payouts.usecase';
import { AdminApprovePayoutUseCase } from '../../application/admin-approve-payout.usecase';
import { AdminBlockPayoutUseCase } from '../../application/admin-block-payout.usecase';
import { StartBatchPayoutUseCase } from '../../application/start-batch-payout.usecase';
import { GetBatchStatusUseCase } from '../../application/get-batch-status.usecase';

describe('AdminPayoutController', () => {
  let provider: AdminPayoutController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminPayoutController,
        { provide: GetPayoutsUseCase, useValue: { execute: jest.fn() } },
        { provide: AdminApprovePayoutUseCase, useValue: { execute: jest.fn() } },
        { provide: AdminBlockPayoutUseCase, useValue: { execute: jest.fn() } },
        { provide: StartBatchPayoutUseCase, useValue: { execute: jest.fn() } },
        { provide: GetBatchStatusUseCase, useValue: { execute: jest.fn() } },
        { provide: 'PayoutPort', useValue: { getBalance: jest.fn() } },
      ],
    }).compile();

    provider = module.get<AdminPayoutController>(AdminPayoutController);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

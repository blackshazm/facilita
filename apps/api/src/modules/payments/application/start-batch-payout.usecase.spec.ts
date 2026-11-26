import { Test, TestingModule } from '@nestjs/testing';
import { StartBatchPayoutUseCase } from './start-batch-payout.usecase';
import { FinancialAuditService } from '../../../shared-kernel/services/financial-audit.service';
import { PrismaService } from '../../../shared-kernel/database/prisma.service';
import { getQueueToken } from '@nestjs/bullmq';
import { BATCH_PAYOUT_QUEUE } from '../infrastructure/queues/queue.constants';

describe('StartBatchPayoutUseCase', () => {
  let provider: StartBatchPayoutUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StartBatchPayoutUseCase,
        {
          provide: 'PayoutRepositoryPort',
          useValue: { findById: jest.fn() },
        },
        {
          provide: FinancialAuditService,
          useValue: { log: jest.fn() },
        },
        {
          provide: PrismaService,
          useValue: { payoutBatch: { create: jest.fn() }, payout: { updateMany: jest.fn() } },
        },
        {
          provide: getQueueToken(BATCH_PAYOUT_QUEUE),
          useValue: { add: jest.fn() },
        },
      ],
    }).compile();

    provider = module.get<StartBatchPayoutUseCase>(StartBatchPayoutUseCase);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { GetBatchStatusUseCase } from './get-batch-status.usecase';
import { PrismaService } from '../../../shared-kernel/database/prisma.service';

describe('GetBatchStatusUseCase', () => {
  let provider: GetBatchStatusUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetBatchStatusUseCase,
        {
          provide: PrismaService,
          useValue: { payoutBatch: { findUnique: jest.fn(), update: jest.fn() } },
        },
      ],
    }).compile();

    provider = module.get<GetBatchStatusUseCase>(GetBatchStatusUseCase);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

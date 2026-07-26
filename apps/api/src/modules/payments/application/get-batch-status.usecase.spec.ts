import { Test, TestingModule } from '@nestjs/testing';
import { GetBatchStatusUseCase } from './get-batch-status.usecase';

describe('GetBatchStatusUseCase', () => {
  let provider: GetBatchStatusUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetBatchStatusUseCase,
        // TODO: Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<GetBatchStatusUseCase>(GetBatchStatusUseCase);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

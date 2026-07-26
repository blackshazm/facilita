import { Test, TestingModule } from '@nestjs/testing';
import { ProcessDailyPayoutsUseCase } from './process-daily-payouts.usecase';

describe('ProcessDailyPayoutsUseCase', () => {
  let provider: ProcessDailyPayoutsUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessDailyPayoutsUseCase,
        // TODO: Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<ProcessDailyPayoutsUseCase>(ProcessDailyPayoutsUseCase);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

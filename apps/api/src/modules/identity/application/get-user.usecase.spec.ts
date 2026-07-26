import { Test, TestingModule } from '@nestjs/testing';
import { GetUserUseCase } from './get-user.usecase';

describe('GetUserUseCase', () => {
  let provider: GetUserUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserUseCase,
        // TODO: Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<GetUserUseCase>(GetUserUseCase);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

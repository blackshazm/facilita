import { Test, TestingModule } from '@nestjs/testing';
import { AuthorizePaymentUseCase } from './authorize-payment.usecase';

describe('AuthorizePaymentUseCase', () => {
  let provider: AuthorizePaymentUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorizePaymentUseCase,
        // TODO: Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<AuthorizePaymentUseCase>(AuthorizePaymentUseCase);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

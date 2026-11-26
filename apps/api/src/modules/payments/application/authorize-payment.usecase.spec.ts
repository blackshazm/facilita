import { Test, TestingModule } from '@nestjs/testing';
import { AuthorizePaymentUseCase } from './authorize-payment.usecase';
import { PrismaService } from '../../../shared-kernel/database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('AuthorizePaymentUseCase', () => {
  let provider: AuthorizePaymentUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorizePaymentUseCase,
        {
          provide: 'PaymentGatewayPort',
          useValue: { authorize: jest.fn() },
        },
        {
          provide: 'PaymentRepositoryPort',
          useValue: { save: jest.fn() },
        },
        {
          provide: 'WalletRepositoryPort',
          useValue: { findByProviderId: jest.fn(), save: jest.fn() },
        },
        {
          provide: PrismaService,
          useValue: { walletTransaction: { create: jest.fn() } },
        },
        {
          provide: EventEmitter2,
          useValue: { emit: jest.fn() },
        },
      ],
    }).compile();

    provider = module.get<AuthorizePaymentUseCase>(AuthorizePaymentUseCase);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { GetUserUseCase } from './get-user.usecase';
import { USER_REPOSITORY_PORT } from '../ports/user-repository.port';
import { PrismaService } from '../../../shared-kernel/database/prisma.service';

describe('GetUserUseCase', () => {
  let provider: GetUserUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserUseCase,
        { provide: USER_REPOSITORY_PORT, useValue: { findById: jest.fn() } },
        { provide: PrismaService, useValue: { wallet: { findUnique: jest.fn() } } },
      ],
    }).compile();

    provider = module.get<GetUserUseCase>(GetUserUseCase);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

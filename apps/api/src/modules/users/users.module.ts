// PRD: 2.4 Usuários e Personas
import { Module } from '@nestjs/common';
import { CreateUserUseCase } from './application/create-user.use-case';
import { USER_REPOSITORY } from './ports/user.repository.port';

// Temporary mock adapter for the repository
const mockUserRepository = {
  findById: async () => null,
  findByPhone: async () => null,
  save: async () => {},
};

@Module({
  providers: [
    CreateUserUseCase,
    {
      provide: USER_REPOSITORY,
      useValue: mockUserRepository, // Replace with Prisma adapter later
    }
  ],
  exports: [CreateUserUseCase],
})
export class UsersModule {}

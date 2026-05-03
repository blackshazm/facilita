import { Injectable, Inject } from '@nestjs/common';
import { User } from '../core/user.entity';
import { UserRepositoryPort, USER_REPOSITORY_PORT } from '../ports/user-repository.port';

@Injectable()
export class GetUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY_PORT)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }
}

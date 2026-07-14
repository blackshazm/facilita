// PRD: 2.4 Usuários e Personas
import { Inject, Injectable } from '@nestjs/common';
import { User, UserRole } from '../core/user.entity';
import { USER_REPOSITORY, UserRepositoryPort } from '../ports/user.repository.port';

export class CreateUserDto {
  phone: string;
  name?: string;
  role: UserRole;
}

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(dto: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findByPhone(dto.phone);
    if (existing) {
      throw new Error('User with this phone already exists');
    }

    const user = new User(
      crypto.randomUUID(),
      dto.phone,
      dto.role,
      dto.name
    );

    await this.userRepository.save(user);
    return user;
  }
}

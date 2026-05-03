import { User } from '../core/user.entity';

export interface UserRepositoryPort {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByPhone(phone: string): Promise<User | null>;
  delete(id: string): Promise<void>;
}

export const USER_REPOSITORY_PORT = Symbol('UserRepositoryPort');

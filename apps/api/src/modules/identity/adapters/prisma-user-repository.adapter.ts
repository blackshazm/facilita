import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared-kernel/database/prisma.service';
import { User, UserRole } from '../core/user.entity';
import { UserRepositoryPort } from '../ports/user-repository.port';

@Injectable()
export class PrismaUserRepository implements UserRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(user: User): Promise<void> {
    const data = user.toJSON();
    await this.prisma.user.upsert({
      where: { id: user.id },
      update: {
        name: data.name,
        role: data.role as any,
        isVerified: data.isVerified,
      },
      create: {
        id: data.id,
        phone: data.phone,
        name: data.name,
        role: data.role as any,
        isVerified: data.isVerified,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!raw) return null;

    return new User({
      id: raw.id,
      phone: raw.phone,
      name: raw.name || undefined,
      role: raw.role as UserRole,
      isVerified: raw.isVerified,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  async findByPhone(phone: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!raw) return null;

    return new User({
      id: raw.id,
      phone: raw.phone,
      name: raw.name || undefined,
      role: raw.role as UserRole,
      isVerified: raw.isVerified,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
}

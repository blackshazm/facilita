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
        inviteCode: data.inviteCode,
        invitedById: data.invitedById,
        referralCount: data.referralCount,
        referralLimit: data.referralLimit,
      },
      create: {
        id: data.id,
        phone: data.phone,
        name: data.name,
        role: data.role as any,
        isVerified: data.isVerified,
        inviteCode: data.inviteCode,
        invitedById: data.invitedById,
        referralCount: data.referralCount,
        referralLimit: data.referralLimit,
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
      inviteCode: raw.inviteCode || undefined,
      invitedById: raw.invitedById || undefined,
      referralCount: raw.referralCount,
      referralLimit: raw.referralLimit,
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
      inviteCode: raw.inviteCode || undefined,
      invitedById: raw.invitedById || undefined,
      referralCount: raw.referralCount,
      referralLimit: raw.referralLimit,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  async findByInviteCode(code: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({
      where: { inviteCode: code },
    });

    if (!raw) return null;

    return new User({
      id: raw.id,
      phone: raw.phone,
      name: raw.name || undefined,
      role: raw.role as UserRole,
      isVerified: raw.isVerified,
      inviteCode: raw.inviteCode || undefined,
      invitedById: raw.invitedById || undefined,
      referralCount: raw.referralCount,
      referralLimit: raw.referralLimit,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  async findDeviceIdsByUserId(userId: string): Promise<string[]> {
    const devices = await this.prisma.userDevice.findMany({
      where: { userId },
      select: { deviceId: true },
    });

    return devices.map((d) => d.deviceId).filter((id): id is string => !!id);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
}

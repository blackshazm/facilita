import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared-kernel/database/prisma.service';
import { Order, OrderStatus } from '../core/order.entity';
import { OrderRepositoryPort } from '../ports/order-repository.port';

@Injectable()
export class PrismaOrderRepository implements OrderRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(order: Order): Promise<void> {
    const data = order.toJSON();
    await this.prisma.order.upsert({
      where: { id: order.id },
      update: {
        status: data.status as any,
        providerId: data.providerId,
        totalAmount: data.totalAmount,
      },
      create: {
        id: data.id,
        userId: data.userId,
        providerId: data.providerId,
        status: data.status as any,
        totalAmount: data.totalAmount,
      },
    });
  }

  async findById(id: string): Promise<Order | null> {
    const raw = await this.prisma.order.findUnique({
      where: { id },
    });
    if (!raw) return null;
    return new Order({
      id: raw.id,
      userId: raw.userId,
      providerId: raw.providerId || undefined,
      status: raw.status as OrderStatus,
      totalAmount: Number(raw.totalAmount),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  async findByUserId(userId: string): Promise<Order[]> {
    const raws = await this.prisma.order.findMany({
      where: { userId },
    });
    return raws.map(
      (raw) =>
        new Order({
          id: raw.id,
          userId: raw.userId,
          providerId: raw.providerId || undefined,
          status: raw.status as OrderStatus,
          totalAmount: Number(raw.totalAmount),
          createdAt: raw.createdAt,
          updatedAt: raw.updatedAt,
        }),
    );
  }
}

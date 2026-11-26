import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared-kernel/database/prisma.service';
import { Dispute } from '../domain/dispute.entity';
import { DisputeRepositoryPort } from '../ports/dispute-repository.port';

@Injectable()
export class PrismaDisputeRepository implements DisputeRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(dispute: Dispute): Promise<void> {
    await this.prisma.dispute.create({
      data: {
        id: dispute.id,
        orderId: dispute.orderId,
        reason: dispute.reason,
        description: dispute.description,
        status: dispute.status as any,
        outcome: dispute.outcome,
        createdAt: dispute.createdAt,
        updatedAt: dispute.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<Dispute | null> {
    const raw = await this.prisma.dispute.findUnique({
      where: { id },
    });
    return raw ? this.toDomain(raw) : null;
  }

  async findByOrderId(orderId: string): Promise<Dispute[]> {
    const list = await this.prisma.dispute.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });
    return list.map(this.toDomain);
  }

  async findPending(): Promise<Dispute[]> {
    const list = await this.prisma.dispute.findMany({
      where: { status: 'OPEN' },
      orderBy: { createdAt: 'asc' },
    });
    return list.map(this.toDomain);
  }

  async findAll(): Promise<Dispute[]> {
    const list = await this.prisma.dispute.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return list.map(this.toDomain);
  }

  async update(dispute: Dispute): Promise<void> {
    await this.prisma.dispute.update({
      where: { id: dispute.id },
      data: {
        status: dispute.status as any,
        outcome: dispute.outcome,
        updatedAt: dispute.updatedAt,
      },
    });
  }

  private toDomain(raw: any): Dispute {
    return new Dispute({
      id: raw.id,
      orderId: raw.orderId,
      reason: raw.reason,
      description: raw.description,
      status: raw.status,
      outcome: raw.outcome,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}

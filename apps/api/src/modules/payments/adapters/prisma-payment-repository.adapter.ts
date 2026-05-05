import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared-kernel/database/prisma.service';
import { PaymentProps, PaymentRepositoryPort } from '../ports/payment-repository.port';

@Injectable()
export class PrismaPaymentRepository implements PaymentRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(payment: PaymentProps): Promise<void> {
    await this.prisma.payment.upsert({
      where: { id: payment.id },
      update: {
        externalId: payment.externalId,
        status: payment.status as any,
        splitAmount: payment.splitAmount,
        ibsAmount: payment.ibsAmount,
        cbsAmount: payment.cbsAmount,
      },
      create: {
        id: payment.id,
        orderId: payment.orderId,
        externalId: payment.externalId,
        amount: payment.amount,
        splitAmount: payment.splitAmount,
        ibsAmount: payment.ibsAmount,
        cbsAmount: payment.cbsAmount,
        method: payment.method as any,
        status: payment.status as any,
      },
    });
  }

  async findById(id: string): Promise<PaymentProps | null> {
    const raw = await this.prisma.payment.findUnique({
      where: { id },
    });
    if (!raw) return null;
    return this.mapToDomain(raw);
  }

  async findByOrderId(orderId: string): Promise<PaymentProps | null> {
    const raw = await this.prisma.payment.findFirst({
      where: { orderId },
    });
    if (!raw) return null;
    return this.mapToDomain(raw);
  }

  private mapToDomain(raw: any): PaymentProps {
    return {
      id: raw.id,
      orderId: raw.orderId,
      externalId: raw.externalId || undefined,
      amount: Number(raw.amount),
      splitAmount: raw.splitAmount ? Number(raw.splitAmount) : undefined,
      ibsAmount: raw.ibsAmount ? Number(raw.ibsAmount) : undefined,
      cbsAmount: raw.cbsAmount ? Number(raw.cbsAmount) : undefined,
      method: raw.method as any,
      status: raw.status as any,
    };
  }
}

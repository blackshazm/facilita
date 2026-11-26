import { PrismaClient } from '@prisma/client';
import { ServiceOrder, ServiceOrderStatus } from '../../domain/entities/service-order.entity';
import { Location } from '../../domain/entities/location.vo';
import { ServiceOrderRepositoryPort } from '../../ports/out/service-order.repository.port';

export class PrismaServiceOrderRepository implements ServiceOrderRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async save(order: ServiceOrder): Promise<void> {
    await (this.prisma as any).order.create({
      data: {
        id: order.id,
        userId: order.customerId,
        status: order.status as any,
        providerId: order.professionalId,
        version: order.version,
        latitude: order.location.latitude,
        longitude: order.location.longitude,
      },
    });
  }

  async findById(id: string): Promise<ServiceOrder | null> {
    const raw = await (this.prisma as any).order.findUnique({ where: { id } });
    if (!raw) return null;

    return new ServiceOrder(
      raw.id,
      raw.userId,
      'geral',
      new Location(raw.latitude || 0, raw.longitude || 0),
      raw.status as ServiceOrderStatus,
      raw.providerId,
      raw.version,
    );
  }

  async updateWithLock(order: ServiceOrder): Promise<void> {
    const previousVersion = order.version - 1;

    // Optimistic Locking: Atualiza se e somente se a versão na base for igual à que resgatamos
    const result = await (this.prisma as any).order.updateMany({
      where: {
        id: order.id,
        version: previousVersion,
      },
      data: {
        status: order.status as any,
        providerId: order.professionalId,
        version: order.version,
      },
    });

    if (result.count === 0) {
      throw new Error(
        'ConcurrencyException: A ordem de serviço foi modificada ou aceita por outro profissional.',
      );
    }
  }
}

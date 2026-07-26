import {
  Injectable,
  Inject,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ORDER_REPOSITORY_PORT, OrderRepositoryPort } from '../ports/order-repository.port';
import { OrderStatus } from '../core/order.entity';
import { PrismaService } from '../../../shared-kernel/database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface CreateOrderDto {
  userId: string;
  serviceId?: string;
  totalAmount: number;
  latitude?: number;
  longitude?: number;
  urgency?: 'normal' | 'urgent';
  description?: string;
}

export interface RequestAdditionalDto {
  description: string;
  amount: number;
  type?: 'MATERIAL' | 'EXTRA_WORK';
  receiptUrl?: string;
}

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @Inject(ORDER_REPOSITORY_PORT) private readonly orderRepository: OrderRepositoryPort,
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Criar um novo pedido de serviço
   */
  async createOrder(dto: CreateOrderDto) {
    // Taxa de urgência (+25%) se urgente
    const finalAmount = dto.urgency === 'urgent' ? dto.totalAmount * 1.25 : dto.totalAmount;

    const order = await this.prisma.order.create({
      data: {
        userId: dto.userId,
        totalAmount: finalAmount,
        latitude: dto.latitude ?? null,
        longitude: dto.longitude ?? null,
        status: 'PENDING',
      },
    });

    this.logger.log(`Pedido criado: ${order.id} (valor: R$ ${finalAmount.toFixed(2)})`);
    this.eventEmitter.emit('order.created', { orderId: order.id, userId: dto.userId });

    return order;
  }

  /**
   * Prestador aceita o pedido -> status MATCHED, dispara evento para criar chat
   */
  async acceptOrder(orderId: string, providerId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Pedido não encontrado');
    if (order.status !== 'PENDING') throw new BadRequestException('Pedido não está disponível para aceite');

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { providerId, status: 'MATCHED' },
    });

    this.logger.log(`Pedido ${orderId} aceito pelo prestador ${providerId}`);

    // Emite evento escutado pelo ChatEventListener (cria canal Stream.io)
    this.eventEmitter.emit('order.accepted', {
      orderId: order.id,
      customerId: order.userId,
      providerId,
    });

    return updated;
  }

  /**
   * Check-in de chegada no local (validação de raio 500m)
   */
  async checkIn(orderId: string, lat: number, lng: number): Promise<void> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    const distance = await this.orderRepository.calculateDistance(orderId, lat, lng);
    if (distance > 500) {
      throw new ForbiddenException(`Location mismatch: ${Math.round(distance)}m from target. Limit is 500m.`);
    }

    order.updateStatus(OrderStatus.ARRIVED);
    await this.orderRepository.save(order);
  }

  /**
   * Iniciar execução do serviço
   */
  async startOrder(orderId: string, providerId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Pedido não encontrado');

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'IN_PROGRESS' },
    });

    this.eventEmitter.emit('order.started', { orderId, providerId });
    return updated;
  }

  /**
   * Finalizar execução pelo prestador com envio de fotos de evidência
   */
  async completeOrder(
    orderId: string,
    providerId: string,
    evidenceUrls?: { beforeUrl?: string; afterUrl?: string },
  ) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Pedido não encontrado');

    // Registrar evidência antes/depois se fornecido
    if (evidenceUrls?.beforeUrl) {
      await this.prisma.evidence.create({
        data: { orderId, type: 'BEFORE', url: evidenceUrls.beforeUrl },
      });
    }
    if (evidenceUrls?.afterUrl) {
      await this.prisma.evidence.create({
        data: { orderId, type: 'AFTER', url: evidenceUrls.afterUrl },
      });
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'DONE' },
    });

    this.logger.log(`Pedido ${orderId} concluído pelo prestador ${providerId}`);

    // Emite evento para encerrar chat e disparar repasse/notificação
    this.eventEmitter.emit('order.completed', { orderId });

    return updated;
  }

  /**
   * Solicitar adicional de custo (materiais ou serviço extra)
   * Regra 1: Máximo 3 adicionais por atendimento
   * Regra 2: Materiais até R$ 30,00 aprovados automaticamente
   */
  async requestAdditional(orderId: string, providerId: string, dto: RequestAdditionalDto) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Pedido não encontrado');

    // Regra: até R$ 30,00 auto-aprovado
    const isAutoApproved = dto.amount <= 30.0;

    const additionalsCount = await this.prisma.evidence.count({
      where: { orderId, type: 'DISPUTE' }, // Reusando tabela ou metadados
    });

    if (additionalsCount >= 3) {
      throw new BadRequestException('Limite máximo de 3 adicionais por pedido atingido');
    }

    this.logger.log(
      `Adicional de R$ ${dto.amount} solicitado para pedido ${orderId} (autoAprovado=${isAutoApproved})`,
    );

    this.eventEmitter.emit('order.additional_requested', {
      orderId,
      providerId,
      amount: dto.amount,
      autoApproved: isAutoApproved,
    });

    return {
      orderId,
      amount: dto.amount,
      description: dto.description,
      status: isAutoApproved ? 'APPROVED' : 'PENDING_CUSTOMER_APPROVAL',
    };
  }

  /**
   * Cliente aprova a conclusão do pedido
   */
  async approveOrder(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Pedido não encontrado');

    this.logger.log(`Cliente ${userId} aprovou a conclusão do pedido ${orderId}`);
    this.eventEmitter.emit('order.approved_by_customer', { orderId, userId });

    return { success: true, message: 'Serviço aprovado com sucesso' };
  }

  /**
   * Cliente aciona garantia de 90 dias
   */
  async claimWarranty(orderId: string, userId: string, reason: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Pedido não encontrado');

    this.logger.warn(`Garantia de 90 dias acionada para pedido ${orderId} por cliente ${userId}`);

    // Cria disputa técnica para reteste sem custo
    await (this.prisma as any).dispute.create({
      data: {
        orderId,
        reason: `GARANTIA_90_DIAS: ${reason}`,
        status: 'OPEN',
      },
    });

    this.eventEmitter.emit('order.warranty_claimed', { orderId, userId, reason });

    return { success: true, message: 'Solicitação de garantia aberta. Entraremos em contato em até 24h.' };
  }
}

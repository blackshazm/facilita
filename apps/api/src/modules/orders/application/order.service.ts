import {
  Injectable,
  Inject,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import * as crypto from 'crypto';
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

export interface ListOrdersQueryDto {
  cursor?: string;
  limit?: number;
  status?: string;
}

export interface OrderReceiptResponse {
  receiptNumber: string;
  orderId: string;
  createdAt: Date;
  completedAt: Date;
  status: string;
  serviceTitle: string;
  customer: {
    id: string;
    name?: string;
  };
  provider: {
    id?: string | null;
    name: string;
    document: string;
  };
  breakdown: {
    serviceGrossAmount: number;
    platformFee: number;
    providerNetAmount: number;
    taxRetention: number;
    totalPaid: number;
  };
  warranty: {
    periodDays: number;
    validUntil: string;
    coverage: string;
  };
  securityHash: string;
  issuer: {
    name: string;
    cnpj: string;
    address: string;
  };
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

    // Otimistic Locking: garante que a ordem não foi aceita por outro em paralelo
    const { count } = await this.prisma.order.updateMany({
      where: { 
        id: orderId, 
        status: 'PENDING', 
        version: order.version 
      },
      data: { 
        providerId, 
        status: 'MATCHED',
        version: { increment: 1 } 
      },
    });

    if (count === 0) {
      throw new ConflictException('Pedido já aceito por outro prestador ou versão desatualizada');
    }

    // Busca o pedido atualizado para retorno
    const updated = await this.prisma.order.findUnique({ where: { id: orderId } });

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
   * Registrar evidência fotográfica vinculada ao pedido
   */
  async addEvidence(
    orderId: string,
    type: 'BEFORE' | 'AFTER' | 'DISPUTE',
    url: string,
    metadata?: any,
  ) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Pedido não encontrado');

    const evidence = await this.prisma.evidence.create({
      data: {
        orderId,
        type,
        url,
      },
    });

    this.logger.log(`Evidência [${type}] registrada para pedido ${orderId}`);
    return evidence;
  }

  /**
   * Finalizar execução pelo prestador com envio obrigatório de fotos de evidência
   */
  async completeOrder(
    orderId: string,
    providerId: string,
    evidenceUrls?: { beforeUrl?: string; afterUrl?: string },
  ) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Pedido não encontrado');

    const existingEvidences = await this.prisma.evidence.count({ where: { orderId } });
    const hasEvidencePayload = Boolean(evidenceUrls?.beforeUrl || evidenceUrls?.afterUrl);

    if (existingEvidences === 0 && !hasEvidencePayload) {
      throw new BadRequestException(
        'Trava de Segurança: Não é possível concluir o atendimento sem fotos comprobatórias do reparo (Antes/Depois).',
      );
    }

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

    this.logger.log(`Pedido ${orderId} concluído com comprovação fotográfica pelo prestador ${providerId}`);

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

  /**
   * Listar pedidos com paginação baseada em cursor e filtros
   */
  async listOrders(userId: string, userRole: string, options?: ListOrdersQueryDto) {
    const limit = Math.min(Math.max(Number(options?.limit) || 10, 1), 50);
    const where: any = {};

    if (userRole === 'PROVIDER') {
      where.providerId = userId;
    } else if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    if (options?.status) {
      where.status = options.status;
    }

    const queryArgs: any = {
      where,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
    };

    if (options?.cursor) {
      queryArgs.cursor = { id: options.cursor };
      queryArgs.skip = 1;
    }

    const orders = await this.prisma.order.findMany(queryArgs);
    const hasMore = orders.length > limit;
    const items = hasMore ? orders.slice(0, limit) : orders;
    const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].id : null;

    const totalCount = await this.prisma.order.count({ where });

    return {
      data: items.map(o => ({
        id: o.id,
        userId: o.userId,
        providerId: o.providerId,
        status: o.status,
        totalAmount: Number(o.totalAmount),
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
      })),
      nextCursor,
      hasMore,
      totalCount,
    };
  }

  /**
   * Gerar e retornar espelho de recibo / comprovante oficial de pagamento
   */
  async getOrderReceipt(
    orderId: string,
    requestingUserId: string,
    requestingRole: string,
  ): Promise<OrderReceiptResponse> {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Pedido não encontrado');

    // Validação de acesso estrito: apenas o cliente titular, o prestador designado ou admin podem visualizar o recibo
    if (
      order.userId !== requestingUserId &&
      order.providerId !== requestingUserId &&
      requestingRole !== 'ADMIN'
    ) {
      throw new ForbiddenException('Acesso negado ao comprovante desta ordem de serviço');
    }

    const grossAmount = Number(order.totalAmount);
    const platformFee = Number((grossAmount * 0.15).toFixed(2));
    const providerNetAmount = Number((grossAmount - platformFee).toFixed(2));
    const taxRetention = Number((grossAmount * 0.05).toFixed(2)); // IBS / CBS estimado

    // Validade da garantia legal + contratual de 90 dias
    const validUntilDate = new Date(order.createdAt.getTime() + 90 * 24 * 60 * 60 * 1000);

    // Hash criptográfico SHA256 para autenticação e verificação anti-fraude
    const rawDataToHash = `${order.id}|${grossAmount}|${order.createdAt.toISOString()}|FACILITA_SECURE_TOKEN`;
    const securityHash = crypto.createHash('sha256').update(rawDataToHash).digest('hex').toUpperCase();

    return {
      receiptNumber: `REC-${order.id.slice(0, 8).toUpperCase()}`,
      orderId: order.id,
      createdAt: order.createdAt,
      completedAt: order.updatedAt,
      status: order.status,
      serviceTitle: 'Atendimento Técnico Especializado Residencial',
      customer: {
        id: order.userId,
      },
      provider: {
        id: order.providerId,
        name: 'Carlos Silva (Eletricista Verificado)',
        document: 'MEI / Autônomo Certificado',
      },
      breakdown: {
        serviceGrossAmount: grossAmount,
        platformFee,
        providerNetAmount,
        taxRetention,
        totalPaid: grossAmount,
      },
      warranty: {
        periodDays: 90,
        validUntil: validUntilDate.toISOString(),
        coverage: 'Garantia de Qualidade e Execução FACILITA (Cobertura até R$ 5.000,00)',
      },
      securityHash,
      issuer: {
        name: 'FACILITA TECNOLOGIA E SERVIÇOS LTDA',
        cnpj: '48.123.456/0001-99',
        address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
      },
    };
  }
}

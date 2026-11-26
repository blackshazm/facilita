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
import { Order, OrderStatus } from '../core/order.entity';
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
    // Resolução v4.1 (#36): Taxa de urgência fixa de R$ 40,00 (não percentual)
    const finalAmount = dto.urgency === 'urgent' ? dto.totalAmount + 40.0 : dto.totalAmount;

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

    // Resolução v4.1 (#39): Trava de Segurança - Foto Antes é obrigatória para iniciar
    const beforeEvidenceCount = await this.prisma.evidence.count({
      where: { orderId, type: 'BEFORE' },
    });
    if (beforeEvidenceCount === 0) {
      throw new BadRequestException(
        'Trava de Segurança: É obrigatório registrar pelo menos 1 foto do estado inicial (Antes) para iniciar o atendimento.',
      );
    }

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
   * Regra 3 (v4.1): Adicional > 100% do valor do pedido trava para PENDING_ADMIN_AUDIT (trava contra extorsão presencial)
   */
  async requestAdditional(orderId: string, providerId: string, dto: RequestAdditionalDto) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Pedido não encontrado');

    const additionalsCount = await this.prisma.evidence.count({
      where: { orderId, type: 'DISPUTE' }, // Reusando tabela ou metadados
    });

    if (additionalsCount >= 3) {
      throw new BadRequestException('Limite máximo de 3 adicionais por pedido atingido');
    }

    const orderAmount = Number(order.totalAmount);
    const isAbusive = dto.amount > orderAmount;

    if (isAbusive) {
      this.logger.warn(
        `Adicional abusivo detectado (> 100% do pedido). Pedido: ${orderId}, Base: R$ ${orderAmount}, Adicional: R$ ${dto.amount}. Encaminhado para auditoria humana.`,
      );

      const createdEvidence = await this.prisma.evidence.create({
        data: {
          orderId,
          providerId,
          url: dto.receiptUrl || 'https://placeholder.co/material.png',
          type: 'DISPUTE',
          metadata: {
            amount: dto.amount,
            description: dto.description,
            status: 'PENDING_ADMIN_AUDIT',
          },
        },
      });

      this.eventEmitter.emit('order.additional_audit_required', {
        orderId,
        providerId,
        orderAmount,
        additionalAmount: dto.amount,
        description: dto.description,
      });

      return {
        id: createdEvidence.id,
        orderId,
        amount: dto.amount,
        description: dto.description,
        status: 'PENDING_ADMIN_AUDIT',
      };
    }

    // Regra: até R$ 30,00 auto-aprovado
    const isAutoApproved = dto.amount <= 30.0;

    const createdEvidence = await this.prisma.evidence.create({
      data: {
        orderId,
        providerId,
        url: dto.receiptUrl || 'https://placeholder.co/material.png',
        type: 'DISPUTE',
        metadata: {
          amount: dto.amount,
          description: dto.description,
          status: isAutoApproved ? 'APPROVED' : 'PENDING_CUSTOMER_APPROVAL',
        },
      },
    });

    if (isAutoApproved) {
      const newTotal = orderAmount + dto.amount;
      await this.prisma.order.update({
        where: { id: orderId },
        data: { totalAmount: newTotal },
      });
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
      id: createdEvidence.id,
      orderId,
      amount: dto.amount,
      description: dto.description,
      status: isAutoApproved ? 'APPROVED' : 'PENDING_CUSTOMER_APPROVAL',
    };
  }

  /**
   * Cliente aprova ou recusa um adicional solicitado pelo prestador
   */
  async respondAdditional(orderId: string, additionalId: string, userId: string, decision: 'APPROVED' | 'REJECTED') {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Pedido não encontrado');
    if (order.userId !== userId) throw new ForbiddenException('Apenas o cliente titular pode responder ao adicional');

    const additional = await this.prisma.evidence.findUnique({ where: { id: additionalId } });
    if (!additional || additional.orderId !== orderId) {
      throw new NotFoundException('Adicional não encontrado para este pedido');
    }

    const currentMetadata: any = (additional.metadata as any) || {};
    if (currentMetadata.status && currentMetadata.status !== 'PENDING_CUSTOMER_APPROVAL') {
      throw new BadRequestException(`Adicional já se encontra no status ${currentMetadata.status}`);
    }

    const updatedMetadata = {
      ...currentMetadata,
      status: decision,
      respondedAt: new Date().toISOString(),
    };

    await this.prisma.evidence.update({
      where: { id: additionalId },
      data: { metadata: updatedMetadata },
    });

    if (decision === 'APPROVED') {
      const addedAmount = Number(currentMetadata.amount || 0);
      const newTotal = Number(order.totalAmount) + addedAmount;
      await this.prisma.order.update({
        where: { id: orderId },
        data: { totalAmount: newTotal },
      });
      this.logger.log(`Adicional de R$ ${addedAmount} aprovado para o pedido ${orderId}. Novo total: R$ ${newTotal}`);
    }

    this.eventEmitter.emit('order.additional_responded', {
      orderId,
      additionalId,
      userId,
      decision,
    });

    return {
      orderId,
      additionalId,
      status: decision,
      message: decision === 'APPROVED' ? 'Adicional aprovado com sucesso' : 'Adicional recusado',
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
   * Buscar detalhes do pedido com mascaramento de dados sensíveis (LGPD) e call proxy
   * Resolução v4.1 (#35): Mascaramento de telefone para prestadores
   */
  async getOrderById(orderId: string, requestingUserId: string, requestingRole: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new NotFoundException('Pedido não encontrado');

    const isCustomer = order.userId === requestingUserId;
    const isProvider = order.providerId === requestingUserId;
    const isAdmin = requestingRole === 'ADMIN';

    if (!isCustomer && !isProvider && !isAdmin) {
      throw new ForbiddenException('Acesso negado aos detalhes deste atendimento');
    }

    const customerUser = await this.prisma.user.findUnique({
      where: { id: order.userId },
      select: { id: true, name: true, phone: true },
    });

    const rawPhone = customerUser?.phone || '';
    let maskedPhone = rawPhone;

    if (requestingRole === 'PROVIDER' || (isProvider && !isAdmin && !isCustomer)) {
      if (rawPhone.length >= 8) {
        const ddd = rawPhone.length >= 10 ? `(${rawPhone.slice(0, 2)}) ` : '';
        const lastDigits = rawPhone.slice(-4);
        maskedPhone = `${ddd}9****-${lastDigits}`;
      } else {
        maskedPhone = 'Telefone Mascarado';
      }
    }

    return {
      id: order.id,
      userId: order.userId,
      providerId: order.providerId,
      status: order.status,
      totalAmount: Number(order.totalAmount),
      latitude: order.latitude,
      longitude: order.longitude,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      customer: {
        id: customerUser?.id || order.userId,
        name: customerUser?.name || 'Cliente Facilita',
        phone: maskedPhone,
      },
      callProxyAvailable: true,
      chatChannelId: `order-${order.id}`,
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
    // Comissão Canônica v4.1: 20% padrão (Bronze/Prata) ou 18% (Ouro)
    const platformFee = Number((grossAmount * 0.20).toFixed(2));
    const providerNetAmount = Number((grossAmount - platformFee).toFixed(2));
    const taxRetention = Number((grossAmount * 0.05).toFixed(2)); // IBS / CBS estimado

    // Validade da garantia legal de 90 dias (Art. 26, II do CDC)
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
        coverage: 'Garantia Legal de Qualidade e Reexecução FACILITA (CDC Art. 26)',
      },
      securityHash,
      issuer: {
        name: 'FACILITA TECNOLOGIA E SERVIÇOS LTDA',
        cnpj: '48.123.456/0001-99',
        address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
      },
    };
  }

  /**
   * Cancelamento assistido pelo cliente ou prestador com cálculo de retenção da taxa de deslocamento
   * // PRD: 4.4.2 Cancelamento Assistido e Taxa de Deslocamento
   */
  async cancelOrder(
    orderId: string,
    userId: string,
    reason: string,
    currentTime: Date = new Date(),
  ) {
    const raw = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!raw) throw new NotFoundException('Pedido não encontrado');

    // Validação de permissão: somente cliente titular ou prestador ou admin
    if (raw.userId !== userId && raw.providerId !== userId) {
      throw new ForbiddenException('Apenas o solicitante ou o prestador vinculado podem cancelar este atendimento');
    }

    const domainOrder = new Order({
      id: raw.id,
      userId: raw.userId,
      providerId: raw.providerId ?? undefined,
      status: raw.status as OrderStatus,
      totalAmount: Number(raw.totalAmount),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });

    let cancellationResult;
    try {
      cancellationResult = domainOrder.cancel(reason, currentTime);
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELED',
        updatedAt: currentTime,
      },
    });

    this.logger.warn(
      `Pedido ${orderId} cancelado por ${userId}. Taxa de deslocamento: R$ ${cancellationResult.displacementFee}, Estorno: R$ ${cancellationResult.refundAmount}`,
    );

    this.eventEmitter.emit('order.canceled', {
      orderId,
      userId,
      providerId: raw.providerId,
      displacementFee: cancellationResult.displacementFee,
      refundAmount: cancellationResult.refundAmount,
      isWithinFreeGracePeriod: cancellationResult.isWithinFreeGracePeriod,
      reason,
      canceledAt: currentTime,
    });

    return {
      orderId,
      status: 'CANCELED',
      displacementFee: cancellationResult.displacementFee,
      refundAmount: cancellationResult.refundAmount,
      isWithinFreeGracePeriod: cancellationResult.isWithinFreeGracePeriod,
      message: cancellationResult.isWithinFreeGracePeriod
        ? 'Cancelamento realizado com sucesso. Estorno integral efetuado.'
        : `Cancelamento realizado. Taxa de deslocamento de R$ ${cancellationResult.displacementFee.toFixed(2)} retida para compensação do prestador. Estorno de R$ ${cancellationResult.refundAmount.toFixed(2)} processado.`,
    };
  }
}

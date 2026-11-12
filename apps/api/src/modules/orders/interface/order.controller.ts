import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrderService, CreateOrderDto, RequestAdditionalDto } from '../application/order.service';
import { JwtAuthGuard } from '../../../shared-kernel/guards/jwt-auth.guard';
import { IdempotencyInterceptor } from '../../../shared-kernel/interceptors/idempotency.interceptor';
import { ChatServicePort, CHAT_SERVICE_PORT } from '../ports/chat-service.port';
import { Inject } from '@nestjs/common';

@Controller('orders')
@UseGuards(JwtAuthGuard)
@UseInterceptors(IdempotencyInterceptor)
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    @Inject(CHAT_SERVICE_PORT) private readonly chatService: ChatServicePort,
  ) {}

  /**
   * GET /orders — Listar histórico paginado de pedidos
   */
  @Get()
  async listOrders(
    @Request() req,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.orderService.listOrders(req.user.id, req.user.role, {
      cursor,
      limit: limit ? Number(limit) : 10,
      status,
    });
  }

  /**
   * POST /orders — Criar novo pedido
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrder(@Request() req, @Body() body: Omit<CreateOrderDto, 'userId'>) {
    return this.orderService.createOrder({
      ...body,
      userId: req.user.id,
    });
  }

  /**
   * POST /orders/:id/accept — Prestador aceita pedido
   */
  @Post(':id/accept')
  @HttpCode(HttpStatus.OK)
  async acceptOrder(@Param('id') id: string, @Request() req) {
    return this.orderService.acceptOrder(id, req.user.id);
  }

  /**
   * POST /orders/:id/check-in — Check-in de chegada no local (raio 500m)
   */
  @Post(':id/check-in')
  @HttpCode(HttpStatus.OK)
  async checkIn(
    @Param('id') id: string,
    @Body() body: { lat: number; lng: number },
  ) {
    await this.orderService.checkIn(id, body.lat, body.lng);
    return { success: true, message: 'Check-in realizado com sucesso' };
  }

  /**
   * POST /orders/:id/start — Prestador inicia execução
   */
  @Post(':id/start')
  @HttpCode(HttpStatus.OK)
  async startOrder(@Param('id') id: string, @Request() req) {
    return this.orderService.startOrder(id, req.user.id);
  }

  /**
   * POST /orders/:id/evidence — Prestador anexa foto de evidência
   */
  @Post(':id/evidence')
  @HttpCode(HttpStatus.CREATED)
  async addEvidence(
    @Param('id') id: string,
    @Body() body: { type: 'BEFORE' | 'AFTER' | 'DISPUTE'; url: string; metadata?: any },
  ) {
    return this.orderService.addEvidence(id, body.type, body.url, body.metadata);
  }

  /**
   * POST /orders/:id/complete — Prestador sinaliza conclusão com fotos
   */
  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  async completeOrder(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { beforeUrl?: string; afterUrl?: string },
  ) {
    return this.orderService.completeOrder(id, req.user.id, body);
  }

  /**
   * POST /orders/:id/additionals — Prestador solicita custo adicional
   */
  @Post(':id/additionals')
  @HttpCode(HttpStatus.CREATED)
  async requestAdditional(
    @Param('id') id: string,
    @Request() req,
    @Body() body: RequestAdditionalDto,
  ) {
    return this.orderService.requestAdditional(id, req.user.id, body);
  }

  /**
   * POST /orders/:id/cancel — Cancelar pedido com cálculo de taxa de deslocamento
   * // PRD: 4.4.2 Cancelamento Assistido e Taxa de Deslocamento
   */
  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelOrder(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { reason: string },
  ) {
    return this.orderService.cancelOrder(id, req.user.id, body?.reason || 'Cancelado pelo solicitante');
  }

  /**
   * POST /orders/:id/approve — Cliente aprova conclusão do serviço
   */
  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  async approveOrder(@Param('id') id: string, @Request() req) {
    return this.orderService.approveOrder(id, req.user.id);
  }

  /**
   * POST /orders/:id/warranty — Cliente aciona garantia de 90 dias
   */
  @Post(':id/warranty')
  @HttpCode(HttpStatus.OK)
  async claimWarranty(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { reason: string },
  ) {
    return this.orderService.claimWarranty(id, req.user.id, body.reason);
  }

  /**
   * GET /orders/:id/receipt — Obter recibo detalhado e garantia do pedido
   */
  @Get(':id/receipt')
  async getReceipt(@Param('id') id: string, @Request() req) {
    return this.orderService.getOrderReceipt(id, req.user.id, req.user.role);
  }

  /**
   * GET /orders/:id/chat-token — Retorna token JWT do Stream.io
   */
  @Get(':id/chat-token')
  async getChatToken(
    @Param('id') orderId: string,
    @Request() req,
  ) {
    const userId: string = req.user.id;
    const { token } = await this.chatService.generateUserToken(userId);

    return {
      userId,
      token,
      channelId: `order-${orderId}`,
      channelType: 'messaging',
      apiKey: process.env.STREAM_IO_API_KEY ?? '',
    };
  }
}

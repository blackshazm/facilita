import {
  Body,
  Controller,
  Post,
  Headers,
  Req,
  Logger,
  UnauthorizedException,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { timingSafeEqual } from 'crypto';
import { PrismaService } from '../../../../shared-kernel/database/prisma.service';
import { CapturePaymentUseCase } from '../../application/capture-payment.usecase';
import { EventEmitter2 } from '@nestjs/event-emitter';

export function verifyAsaasWebhookToken(
  receivedToken: string | undefined | null,
  storedSecret: string | undefined | null
): boolean {
  if (!receivedToken || !storedSecret) return false;
  const a = Buffer.from(receivedToken);
  const b = Buffer.from(storedSecret);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

@Controller('payments/webhooks/asaas')
export class AsaasWebhookController {
  private readonly logger = new Logger(AsaasWebhookController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly capturePayment: CapturePaymentUseCase,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleAsaasWebhook(
    @Req() req: any,
    @Body() body: any,
    @Headers('asaas-access-token') webhookToken: string,
  ) {
    const expectedSecret = process.env.ASAAS_WEBHOOK_SECRET;

    // 1. Validação de token em tempo constante (anti-timing attacks)
    if (expectedSecret && !verifyAsaasWebhookToken(webhookToken, expectedSecret)) {
      this.logger.warn('[Asaas Webhook] Tentativa de webhook rejeitada: token inválido.');
      throw new UnauthorizedException('INVALID_WEBHOOK_TOKEN');
    }

    const eventId = body?.id || body?.eventSyncId;
    const eventType = body?.event;

    if (!eventId || !eventType) {
      throw new BadRequestException('MALFORMED_WEBHOOK_PAYLOAD');
    }

    // 2. Idempotência Zero-Trust
    const existing = await this.prisma.processedWebhook.findUnique({
      where: { eventId: String(eventId) },
    });

    if (existing) {
      this.logger.log(`[Asaas Webhook Idempotency] Evento duplicado ignorado: ${eventId}`);
      return { received: true, duplicate: true };
    }

    await this.prisma.processedWebhook.create({
      data: {
        eventId: String(eventId),
        provider: 'ASAAS',
      },
    });

    this.logger.log(`[Asaas Webhook] Processando evento: ${eventType} (ID: ${eventId})`);

    // 3. Processamento de Eventos
    try {
      switch (eventType) {
        case 'PAYMENT_RECEIVED':
        case 'PAYMENT_CONFIRMED': {
          const paymentData = body?.payment;
          const orderId = paymentData?.externalReference;
          const externalPaymentId = paymentData?.id;

          if (!orderId) {
            this.logger.warn(`[Asaas Webhook] Evento de pagamento sem externalReference (orderId): ${externalPaymentId}`);
            break;
          }

          this.logger.log(`[Asaas Webhook] Pagamento confirmado para pedido: ${orderId}`);

          // Atualiza status do Payment para PAID
          const payment = await this.prisma.payment.findFirst({
            where: { orderId },
          });

          if (payment) {
            await this.prisma.payment.update({
              where: { id: payment.id },
              data: {
                status: 'PAID',
                externalId: externalPaymentId || payment.externalId,
              },
            });
          }

          // Busca o pedido para verificar se já existe prestador atribuído
          const order = await this.prisma.order.findUnique({
            where: { id: orderId },
          });

          if (order && order.providerId) {
            try {
              await this.capturePayment.execute(orderId, order.providerId);
            } catch (captureErr: any) {
              this.logger.warn(`[Asaas Webhook Capture Note]: ${captureErr.message}`);
            }
          }

          // Notifica os ouvintes da plataforma
          this.eventEmitter.emit('order.paid', {
            orderId,
            externalId: externalPaymentId,
            amount: paymentData?.value ? Math.round(paymentData.value * 100) : undefined,
          });

          break;
        }

        case 'PAYMENT_REFUNDED': {
          const orderId = body?.payment?.externalReference;
          if (orderId) {
            this.logger.log(`[Asaas Webhook] Estorno confirmado para pedido: ${orderId}`);
            await this.prisma.payment.updateMany({
              where: { orderId },
              data: { status: 'REFUNDED' },
            });
            this.eventEmitter.emit('order.refunded', { orderId });
          }
          break;
        }

        case 'TRANSFER_DONE': {
          const transferId = body?.transfer?.id;
          this.logger.log(`[Asaas Webhook] Transferência PIX concluída com sucesso: ${transferId}`);
          break;
        }

        case 'TRANSFER_FAILED': {
          const transferId = body?.transfer?.id;
          const failReason = body?.transfer?.failReason;
          this.logger.error(`[Asaas Webhook] Transferência PIX falhou: ${transferId} - Motivo: ${failReason}`);
          break;
        }

        default:
          this.logger.log(`[Asaas Webhook] Evento ignorado ou não-crítico: ${eventType}`);
      }

      return { received: true, eventId };
    } catch (err: any) {
      this.logger.error(`[Asaas Webhook Processing Error]: ${err.message}`, err.stack);
      return { received: false, error: err.message };
    }
  }
}

import { Body, Controller, Post, Headers, Req, Logger } from '@nestjs/common';
import { CapturePaymentUseCase } from '../../application/capture-payment.usecase';
import { ProcessPayoutWebhookUseCase } from '../../application/process-payout-webhook.usecase';
import { PrismaService } from '../../../../shared-kernel/database/prisma.service';

@Controller('payments/webhooks')
export class PaymentWebhookController {
  private readonly logger = new Logger(PaymentWebhookController.name);

  constructor(
    private readonly capturePayment: CapturePaymentUseCase,
    private readonly processPayoutWebhook: ProcessPayoutWebhookUseCase,
    private readonly prisma: PrismaService,
  ) {}

  @Post('pagarme')
  async handlePagarMeWebhook(
    @Req() req: any,
    @Body() body: any,
    @Headers('x-pagarme-signature') signature: string,
  ) {
    const eventId = body?.id || body?.event_id || body?.data?.id || req?.headers?.['x-pagarme-event-id'];

    if (eventId) {
      const existing = await this.prisma.processedWebhook.findUnique({
        where: { eventId: String(eventId) },
      });

      if (existing) {
        this.logger.warn(`[Webhook Idempotency] Evento duplicado ignorado: ${eventId}`);
        return { received: true, duplicate: true };
      }

      await this.prisma.processedWebhook.create({
        data: {
          eventId: String(eventId),
          provider: 'PAGARME',
        },
      });
    }

    // 1. Delegar eventos de transferência do Pagar.me para o caso de uso
    if (body && body.type && body.type.startsWith('transfer.')) {
      return this.processPayoutWebhook.execute(req.rawBody, signature, body);
    }

    // 2. Lógica para outros eventos
    const event = body?.event;
    
    if (event === 'charge.paid') {
      const orderId = body?.data?.order?.id;
      this.logger.log(`[Webhook Pagar.me] Pagamento confirmado para pedido externo: ${orderId}`);
    }

    return { received: true };
  }
}

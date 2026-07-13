import { Body, Controller, Post, Headers, Req } from '@nestjs/common';
import { CapturePaymentUseCase } from '../../application/capture-payment.usecase';
import { ProcessPayoutWebhookUseCase } from '../../application/process-payout-webhook.usecase';

@Controller('payments/webhooks')
export class PaymentWebhookController {
  constructor(
    private readonly capturePayment: CapturePaymentUseCase,
    private readonly processPayoutWebhook: ProcessPayoutWebhookUseCase,
  ) {}

  @Post('pagarme')
  async handlePagarMeWebhook(
    @Req() req: any,
    @Body() body: any,
    @Headers('x-pagarme-signature') signature: string,
  ) {
    // 1. Delegar eventos de transferência do Pagar.me para o caso de uso
    if (body && body.type && body.type.startsWith('transfer.')) {
      return this.processPayoutWebhook.execute(req.rawBody, signature, body);
    }

    // 2. Lógica para outros eventos
    const event = body.event;
    
    if (event === 'charge.paid') {
      const orderId = body.data.order.id; // external order id
      // logic to find internal orderId and providerId would go here
      // This is a placeholder for the idempotent webhook logic
    }

    return { received: true };
  }
}

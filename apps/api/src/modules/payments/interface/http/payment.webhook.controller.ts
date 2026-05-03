import { Body, Controller, Post, Headers, BadRequestException } from '@nestjs/common';
import { CapturePaymentUseCase } from '../../application/capture-payment.usecase';

@Controller('payments/webhooks')
export class PaymentWebhookController {
  constructor(
    private readonly capturePayment: CapturePaymentUseCase,
  ) {}

  @Post('pagarme')
  async handlePagarMeWebhook(
    @Body() body: any,
    @Headers('x-pagarme-signature') signature: string,
  ) {
    // 1. Validate signature (Omitted for brevity in MVP, but planned in Security Model)
    // 2. Handle events
    const event = body.event;
    
    if (event === 'charge.paid') {
      const orderId = body.data.order.id; // external order id
      // logic to find internal orderId and providerId would go here
      // This is a placeholder for the idempotent webhook logic
    }

    return { received: true };
  }
}

import { PaymentGatewayPort } from '../ports/payments.port';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class StripePaymentGatewayAdapter implements PaymentGatewayPort {
  private readonly logger = new Logger(StripePaymentGatewayAdapter.name);

  async transferToProvider(providerId: string, amountCents: number): Promise<string> {
    this.logger.log(`[MOCK STRIPE] Transferring ${amountCents} cents to provider ${providerId}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulate Stripe Transfer ID
    const txId = `tr_${Math.random().toString(36).substring(7)}`;
    this.logger.log(`[MOCK STRIPE] Transfer successful. ID: ${txId}`);
    
    return txId;
  }
}

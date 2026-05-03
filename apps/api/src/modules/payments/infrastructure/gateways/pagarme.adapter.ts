import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PaymentAuthorizeProps, PaymentGatewayPort, PaymentResult } from '../../ports/payment-gateway.port';

@Injectable()
export class PagarMeAdapter implements PaymentGatewayPort {
  private readonly baseUrl = 'https://api.pagar.me/core/v5';
  private readonly apiKey = process.env.PAGARME_SECRET_KEY;

  async authorize(props: PaymentAuthorizeProps): Promise<PaymentResult> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/orders`,
        {
          items: [
            {
              amount: props.amount,
              description: `Order ${props.orderId}`,
              quantity: 1,
            },
          ],
          payments: [
            {
              payment_method: props.paymentMethod === 'CARD' ? 'credit_card' : 'pix',
              credit_card: props.paymentMethod === 'CARD' ? {
                card_token: props.cardToken,
                operation_type: 'auth_only',
              } : undefined,
              pix: props.paymentMethod === 'PIX' ? {
                expires_in: 3600,
              } : undefined,
            },
          ],
        },
        {
          headers: {
            Authorization: `Basic ${Buffer.from(`${this.apiKey}:`).toString('base64')}`,
          },
        }
      );

      const statusMap: Record<string, any> = {
        'pending': 'PENDING',
        'paid': 'PAID',
        'authorized': 'AUTHORIZED',
        'failed': 'FAILED',
      };

      return {
        externalId: response.data.id,
        status: statusMap[response.data.status] || 'PENDING',
        rawResponse: response.data,
      };
    } catch (error: any) {
      console.error('PagarMe Authorization Error:', error.response?.data || error.message);
      return {
        externalId: '',
        status: 'FAILED',
        rawResponse: error.response?.data,
      };
    }
  }

  async capture(externalId: string, amount?: number): Promise<PaymentResult> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/orders/${externalId}/capture`,
        { amount },
        {
          headers: {
            Authorization: `Basic ${Buffer.from(`${this.apiKey}:`).toString('base64')}`,
          },
        }
      );

      return {
        externalId: response.data.id,
        status: 'PAID',
        rawResponse: response.data,
      };
    } catch (error: any) {
      console.error('PagarMe Capture Error:', error.response?.data || error.message);
      return {
        externalId,
        status: 'FAILED',
        rawResponse: error.response?.data,
      };
    }
  }

  async refund(externalId: string, amount?: number): Promise<PaymentResult> {
    // Implementation for refund
    return { externalId, status: 'REFUNDED' };
  }
}

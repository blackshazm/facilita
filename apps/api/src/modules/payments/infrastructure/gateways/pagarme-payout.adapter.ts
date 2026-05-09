import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PayoutPort, PayoutTransferRequest, PayoutTransferResponse } from '../../ports/payout.port';

@Injectable()
export class PagarMePayoutAdapter implements PayoutPort {
  private readonly baseUrl = 'https://api.pagar.me/core/v5';
  private readonly apiKey = process.env.PAGARME_SECRET_KEY;

  async transfer(request: PayoutTransferRequest): Promise<PayoutTransferResponse> {
    if (this.apiKey === 'sk_test_mock') {
      return {
        externalId: 'tr_' + Math.random().toString(36).substring(7),
        status: 'PAID',
        fee: 500n,
      };
    }
    try {
      const response = await axios.post(
        `${this.baseUrl}/transfers`,
        {
          amount: Number(request.amount),
          recipient_id: request.recipientId,
          metadata: {
            ...request.metadata,
            providerId: request.providerId,
          },
        },
        {
          headers: {
            Authorization: `Basic ${Buffer.from(`${this.apiKey}:`).toString('base64')}`,
            'idempotency-key': request.idempotencyKey,
          },
        }
      );

      return {
        externalId: response.data.id,
        status: this.mapStatus(response.data.status),
        fee: BigInt(response.data.fee || 0),
      };
    } catch (error: any) {
      console.error('PagarMe Transfer Error:', error.response?.data || error.message);
      return {
        externalId: '',
        status: 'FAILED',
        fee: 0n,
      };
    }
  }

  async getBalance(recipientId: string): Promise<bigint> {
    if (this.apiKey === 'sk_test_mock') {
      return 1000000n; // R$ 10.000,00
    }
    try {
      const response = await axios.get(
        `${this.baseUrl}/recipients/${recipientId}/balance`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(`${this.apiKey}:`).toString('base64')}`,
          },
        }
      );

      return BigInt(response.data.available || 0);
    } catch (error: any) {
      console.error('PagarMe GetBalance Error:', error.response?.data || error.message);
      throw new Error(`Failed to fetch balance for recipient ${recipientId}`);
    }
  }

  private mapStatus(status: string): 'PROCESSING' | 'PAID' | 'FAILED' {
    const statusMap: Record<string, 'PROCESSING' | 'PAID' | 'FAILED'> = {
      'pending': 'PROCESSING',
      'processing': 'PROCESSING',
      'transferred': 'PAID',
      'failed': 'FAILED',
      'canceled': 'FAILED',
    };
    return statusMap[status] || 'PROCESSING';
  }
}

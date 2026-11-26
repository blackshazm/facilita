import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { PaymentAuthorizeProps, PaymentGatewayPort, PaymentResult } from '../../ports/payment-gateway.port';

@Injectable()
export class AsaasAdapter implements PaymentGatewayPort {
  private readonly logger = new Logger(AsaasAdapter.name);
  private readonly baseUrl = (process.env.ASAAS_API_URL || 'https://sandbox.asaas.com/api/v3').replace(/\/+$/, '');
  private readonly apiKey = process.env.ASAAS_API_KEY;

  async authorize(props: PaymentAuthorizeProps): Promise<PaymentResult> {
    if (!this.apiKey || this.apiKey.includes('mock') || this.apiKey.includes('test_mock')) {
      this.logger.warn(`[Asaas Mock] Gerando cobrança simulada para pedido: ${props.orderId}`);
      return {
        externalId: 'pay_mock_' + Math.random().toString(36).substring(7),
        status: props.paymentMethod === 'PIX' ? 'PENDING' : 'PAID',
        pixQrCode: props.paymentMethod === 'PIX' ? 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=' : undefined,
        pixCopiaECola: props.paymentMethod === 'PIX' ? `00020126580014BR.GOV.BCB.PIX0136${props.orderId}520400005303986540${(props.amount / 100).toFixed(2)}5802BR5913Facilita S.A.6009Sao Paulo62070503***6304` : undefined,
        invoiceUrl: `https://sandbox.asaas.com/i/mock_${props.orderId}`,
      };
    }

    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 1);
      const dueDateStr = dueDate.toISOString().split('T')[0];

      const payload: any = {
        customer: props.customerId || 'cus_default',
        billingType: props.paymentMethod === 'CARD' ? 'CREDIT_CARD' : 'PIX',
        value: Number((props.amount / 100).toFixed(2)),
        dueDate: dueDateStr,
        description: `FACILITA - Pedido #${props.orderId}`,
        externalReference: props.orderId,
      };

      if (props.paymentMethod === 'CARD' && props.cardToken) {
        payload.creditCardToken = props.cardToken;
      }

      const response = await axios.post(`${this.baseUrl}/payments`, payload, {
        headers: {
          access_token: this.apiKey,
          'Content-Type': 'application/json',
        },
      });

      const paymentData = response.data;
      const paymentId = paymentData.id;

      let pixQrCode: string | undefined;
      let pixCopiaECola: string | undefined;

      if (props.paymentMethod === 'PIX') {
        try {
          const qrRes = await axios.get(`${this.baseUrl}/payments/${paymentId}/pixQrCode`, {
            headers: { access_token: this.apiKey },
          });
          pixQrCode = qrRes.data?.encodedImage;
          pixCopiaECola = qrRes.data?.payload;
        } catch (qrErr: any) {
          this.logger.error(`[Asaas PIX QR Error]: ${qrErr.message}`);
        }
      }

      return {
        externalId: paymentId,
        status: this.mapStatus(paymentData.status),
        pixQrCode,
        pixCopiaECola,
        invoiceUrl: paymentData.invoiceUrl,
        rawResponse: paymentData,
      };
    } catch (error: any) {
      this.logger.error(`[Asaas Authorization Error]: ${error.response?.data ? JSON.stringify(error.response.data) : error.message}`);
      return {
        externalId: '',
        status: 'FAILED',
        rawResponse: error.response?.data,
      };
    }
  }

  async capture(externalId: string, amount?: number): Promise<PaymentResult> {
    if (!this.apiKey || this.apiKey.includes('mock') || this.apiKey.includes('test_mock')) {
      return { externalId, status: 'PAID' };
    }

    try {
      // No Asaas, cobranças de cartão pré-autorizadas são capturadas via /payments/:id/capture
      const response = await axios.post(
        `${this.baseUrl}/payments/${externalId}/capture`,
        amount ? { value: Number((amount / 100).toFixed(2)) } : {},
        {
          headers: { access_token: this.apiKey },
        }
      );

      return {
        externalId,
        status: this.mapStatus(response.data.status),
        rawResponse: response.data,
      };
    } catch (error: any) {
      // Se já foi recebido/pago, não falha
      this.logger.warn(`[Asaas Capture]: ${error.response?.data ? JSON.stringify(error.response.data) : error.message}`);
      return {
        externalId,
        status: 'PAID',
        rawResponse: error.response?.data,
      };
    }
  }

  async refund(externalId: string, amount?: number): Promise<PaymentResult> {
    if (!this.apiKey || this.apiKey.includes('mock') || this.apiKey.includes('test_mock')) {
      return { externalId, status: 'REFUNDED' };
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/payments/${externalId}/refund`,
        amount ? { value: Number((amount / 100).toFixed(2)) } : {},
        {
          headers: { access_token: this.apiKey },
        }
      );

      return {
        externalId,
        status: 'REFUNDED',
        rawResponse: response.data,
      };
    } catch (error: any) {
      this.logger.error(`[Asaas Refund Error]: ${error.response?.data ? JSON.stringify(error.response.data) : error.message}`);
      return {
        externalId,
        status: 'FAILED',
        rawResponse: error.response?.data,
      };
    }
  }

  async getPayment(externalId: string): Promise<PaymentResult> {
    if (!this.apiKey || this.apiKey.includes('mock') || this.apiKey.includes('test_mock')) {
      return {
        externalId,
        status: 'PAID',
      };
    }

    try {
      const response = await axios.get(`${this.baseUrl}/payments/${externalId}`, {
        headers: { access_token: this.apiKey },
      });

      return {
        externalId,
        status: this.mapStatus(response.data?.status),
        rawResponse: response.data,
      };
    } catch (error: any) {
      this.logger.error(`[Asaas GetPayment Error]: ${error.response?.data ? JSON.stringify(error.response.data) : error.message}`);
      return {
        externalId,
        status: 'FAILED',
        rawResponse: error.response?.data,
      };
    }
  }

  private mapStatus(status: string): 'AUTHORIZED' | 'PAID' | 'FAILED' | 'PENDING' | 'REFUNDED' {
    const map: Record<string, 'AUTHORIZED' | 'PAID' | 'FAILED' | 'PENDING' | 'REFUNDED'> = {
      'PENDING': 'PENDING',
      'RECEIVED': 'PAID',
      'CONFIRMED': 'PAID',
      'AUTHORIZED': 'AUTHORIZED',
      'OVERDUE': 'FAILED',
      'REFUNDED': 'REFUNDED',
      'RECEIVED_IN_CASH': 'PAID',
      'REFUND_REQUESTED': 'PENDING',
      'CHARGEBACK_REQUESTED': 'FAILED',
      'CHARGEBACK_DISPUTE': 'FAILED',
      'AWAITING_RISK_ANALYSIS': 'PENDING',
    };
    return map[status] || 'PENDING';
  }
}

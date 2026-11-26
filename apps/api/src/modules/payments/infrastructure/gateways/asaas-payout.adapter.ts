import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { PayoutPort, PayoutTransferRequest, PayoutTransferResponse } from '../../ports/payout.port';

@Injectable()
export class AsaasPayoutAdapter implements PayoutPort {
  private readonly logger = new Logger(AsaasPayoutAdapter.name);
  private readonly baseUrl = (process.env.ASAAS_API_URL || 'https://sandbox.asaas.com/api/v3').replace(/\/+$/, '');
  private readonly apiKey = process.env.ASAAS_API_KEY;

  async transfer(request: PayoutTransferRequest): Promise<PayoutTransferResponse> {
    if (!this.apiKey || this.apiKey.includes('mock') || this.apiKey.includes('test_mock')) {
      this.logger.warn(`[Asaas Payout Mock] Simulando transferência PIX de R$ ${(Number(request.amount) / 100).toFixed(2)} para prestador ${request.providerId}`);
      return {
        externalId: 'transf_mock_' + Math.random().toString(36).substring(7),
        status: 'PAID',
        fee: 99n, // Taxa média de PIX Asaas (R$ 0,99 em centavos)
      };
    }

    try {
      // No Asaas, transferência PIX usa POST /v3/transfers
      const pixKey = request.metadata?.pixKey || request.recipientId;
      const pixKeyType = request.metadata?.pixKeyType || this.detectPixKeyType(pixKey);

      const response = await axios.post(
        `${this.baseUrl}/transfers`,
        {
          value: Number((Number(request.amount) / 100).toFixed(2)),
          operationType: 'PIX',
          pixAddressKey: pixKey,
          pixAddressKeyType: pixKeyType,
          description: `Repasse Facilita - Prestador ${request.providerId}`,
          scheduleDate: null, // Imediato
        },
        {
          headers: {
            access_token: this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = response.data;
      return {
        externalId: data.id,
        status: this.mapStatus(data.status),
        fee: data.netValue ? BigInt(Math.round((data.value - data.netValue) * 100)) : 99n,
      };
    } catch (error: any) {
      this.logger.error(`[Asaas Payout Error]: ${error.response?.data ? JSON.stringify(error.response.data) : error.message}`);
      return {
        externalId: '',
        status: 'FAILED',
        fee: 0n,
      };
    }
  }

  async getBalance(recipientId: string): Promise<bigint> {
    if (!this.apiKey || this.apiKey.includes('mock') || this.apiKey.includes('test_mock')) {
      return 1000000n; // R$ 10.000,00 simulados
    }

    try {
      const response = await axios.get(`${this.baseUrl}/finance/balance`, {
        headers: { access_token: this.apiKey },
      });

      // Retorna em centavos
      const balanceInReais = response.data?.balance || 0;
      return BigInt(Math.round(balanceInReais * 100));
    } catch (error: any) {
      this.logger.error(`[Asaas GetBalance Error]: ${error.response?.data ? JSON.stringify(error.response.data) : error.message}`);
      throw new Error(`Failed to fetch Asaas balance: ${error.message}`);
    }
  }

  async getTransfer(externalId: string): Promise<PayoutTransferResponse> {
    if (!this.apiKey || this.apiKey.includes('mock') || this.apiKey.includes('test_mock')) {
      return {
        externalId,
        status: 'PAID',
        fee: 99n,
      };
    }

    try {
      const response = await axios.get(`${this.baseUrl}/transfers/${externalId}`, {
        headers: { access_token: this.apiKey },
      });

      const data = response.data;
      return {
        externalId: data.id,
        status: this.mapStatus(data.status),
        fee: data.netValue ? BigInt(Math.round((data.value - data.netValue) * 100)) : 99n,
      };
    } catch (error: any) {
      this.logger.error(`[Asaas GetTransfer Error]: ${error.response?.data ? JSON.stringify(error.response.data) : error.message}`);
      return {
        externalId,
        status: 'FAILED',
        fee: 0n,
      };
    }
  }

  private detectPixKeyType(key: string): 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'EVP' {
    if (!key) return 'EVP';
    const clean = key.replace(/\D/g, '');
    if (clean.length === 11) return 'CPF';
    if (clean.length === 14) return 'CNPJ';
    if (key.includes('@')) return 'EMAIL';
    if (clean.length >= 10 && clean.length <= 13) return 'PHONE';
    return 'EVP';
  }

  private mapStatus(status: string): 'PROCESSING' | 'PAID' | 'FAILED' {
    const map: Record<string, 'PROCESSING' | 'PAID' | 'FAILED'> = {
      'PENDING': 'PROCESSING',
      'BANK_PROCESSING': 'PROCESSING',
      'DONE': 'PAID',
      'CANCELLED': 'FAILED',
      'FAILED': 'FAILED',
    };
    return map[status] || 'PROCESSING';
  }
}

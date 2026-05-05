import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface ENotasInvoiceRequest {
  externalId: string; // Pagar.me ID
  customerName: string;
  customerEmail: string;
  customerCpfCnpj: string;
  serviceDescription: string;
  totalAmount: number;
  commissionAmount: number;
  serviceCode?: string;
  cityServiceCode?: string;
}

@Injectable()
export class ENotasGatewayAdapter {
  private readonly logger = new Logger(ENotasGatewayAdapter.name);
  private readonly apiKey = process.env.ENOTAS_API_KEY || 'MOCK_KEY';
  private readonly baseUrl = 'https://api.notagateway.com.br/v2';

  async issueInvoice(request: ENotasInvoiceRequest): Promise<{ externalId: string }> {
    this.logger.log(`Issuing invoice for externalId: ${request.externalId}`);
    
    // In a real implementation, we would call eNotas API:
    // await axios.post(`${this.baseUrl}/vendas`, { ... }, { headers: { Authorization: `Bearer ${this.apiKey}` } });
    
    // For now, we mock the success response
    return {
      externalId: `en_mock_${Math.random().toString(36).substring(7)}`,
    };
  }
}

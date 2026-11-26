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
  private readonly apiKey = process.env.ENOTAS_API_KEY || '';
  private readonly baseUrl = process.env.ENOTAS_BASE_URL || 'https://api.enotas.com.br/v2';

  async issueInvoice(request: ENotasInvoiceRequest): Promise<{ externalId: string }> {
    this.logger.log(`Solicitando emissão de nota fiscal para externalId: ${request.externalId}`);
    
    // Se a chave estiver configurada para produção/staging, faz a chamada real via HTTP
    if (this.apiKey && this.apiKey !== 'MOCK_KEY') {
      try {
        const response = await axios.post(
          `${this.baseUrl}/vendas`,
          {
            cliente: {
              nome: request.customerName,
              email: request.customerEmail,
              cpfCnpj: request.customerCpfCnpj.replace(/\D/g, ''),
            },
            servico: {
              descricao: request.serviceDescription,
              valorTotal: request.commissionAmount, // NF-e de intermediação sobre a comissão da Facilita
              codigoServicoMunicipio: request.cityServiceCode || request.serviceCode,
            },
            idExterno: request.externalId,
          },
          {
            headers: {
              Authorization: `Basic ${Buffer.from(this.apiKey + ':').toString('base64')}`,
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          },
        );

        const externalId = response.data?.id || `en_${request.externalId}`;
        this.logger.log(`NF-e emitida com sucesso no eNotas: ${externalId}`);
        return { externalId };
      } catch (error: any) {
        this.logger.error(
          `Falha ao emitir nota fiscal no eNotas para pedido ${request.externalId}: ${error.response?.data?.mensagem || error.message}`,
          error.stack,
        );
        throw error;
      }
    }

    // Fallback gracioso para ambiente local de desenvolvimento ou testes
    this.logger.warn(
      `ENOTAS_API_KEY ausente ou em modo MOCK. Gerando identificador simulado seguro para ambiente dev/test.`,
    );
    return {
      externalId: `en_mock_${Math.random().toString(36).substring(7)}`,
    };
  }
}

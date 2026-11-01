import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { SmsServicePort } from '../ports/auth.service.port';

export function normalizePhoneNumber(rawPhone: string): string {
  if (!rawPhone) return '';
  const trimmed = rawPhone.trim();
  const digitsOnly = trimmed.replace(/\D/g, '');
  if (!digitsOnly) return '';

  // Se já começar com o símbolo '+', preservar formato internacional
  if (trimmed.startsWith('+')) {
    return `+${digitsOnly}`;
  }

  // Se começar com código do Brasil (55) com 12 ou 13 dígitos
  if ((digitsOnly.length === 12 || digitsOnly.length === 13) && digitsOnly.startsWith('55')) {
    return `+${digitsOnly}`;
  }

  // Se for celular/fixo padrão BR (10 ou 11 dígitos, ex: 11999999999)
  if (digitsOnly.length === 10 || digitsOnly.length === 11) {
    return `+55${digitsOnly}`;
  }

  return `+${digitsOnly}`;
}

@Injectable()
export class TwilioSmsAdapter implements SmsServicePort {
  private readonly logger = new Logger(TwilioSmsAdapter.name);

  async sendSms(phone: string, message: string): Promise<void> {
    const normalizedPhone = normalizePhoneNumber(phone);
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_FROM;
    const zapiInstanceId = process.env.ZAPI_INSTANCE_ID;
    const zapiToken = process.env.ZAPI_TOKEN;

    // 1. Se credenciais da Twilio estiverem configuradas, envia SMS oficial
    if (twilioAccountSid && twilioAuthToken && twilioFrom) {
      try {
        const auth = Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64');
        const params = new URLSearchParams();
        params.append('To', normalizedPhone);
        params.append('From', twilioFrom);
        params.append('Body', message);

        await axios.post(
          `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
          params.toString(),
          {
            headers: {
              Authorization: `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            timeout: 5000,
          },
        );

        this.logger.log(`[Twilio SMS] Código despachado com sucesso para ${normalizedPhone.slice(0, 7)}****`);
        return;
      } catch (error: any) {
        this.logger.error(
          `[Twilio SMS] Falha no disparo para ${normalizedPhone.slice(0, 7)}****: ${error.response?.data?.message || error.message}`,
        );
        // Não quebra se tiver fallback ou for ambiente híbrido
      }
    }

    // 2. Se Z-API WhatsApp estiver configurada, envia via WhatsApp
    if (zapiInstanceId && zapiToken) {
      try {
        const zapiPhone = normalizedPhone.replace('+', '');
        const clientToken = process.env.ZAPI_CLIENT_TOKEN;
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (clientToken) {
          headers['Client-Token'] = clientToken;
        }

        await axios.post(
          `https://api.z-api.io/instances/${zapiInstanceId}/token/${zapiToken}/send-text`,
          {
            phone: zapiPhone,
            message,
          },
          { headers, timeout: 5000 },
        );

        this.logger.log(`[Z-API WhatsApp] Código despachado com sucesso para ${zapiPhone.slice(0, 6)}****`);
        return;
      } catch (error: any) {
        this.logger.error(
          `[Z-API WhatsApp] Falha no disparo: ${error.response?.data?.message || error.message}`,
        );
      }
    }

    // 3. Fallback Gracioso de Desenvolvimento / Testes / Mock
    this.logger.log(`[SMS/WhatsApp Simulação Dev] Para: ${normalizedPhone} | Mensagem: "${message}"`);
  }
}

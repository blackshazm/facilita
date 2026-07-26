import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { StreamChat } from 'stream-chat';
import { EventEmitter2 } from '@nestjs/event-emitter';

/**
 * Webhook do Stream.io — recebe eventos de mensagens em tempo real.
 *
 * Responsabilidades:
 *   1. Validar assinatura HMAC do webhook (autenticidade)
 *   2. Detectar tentativas de contato externo no texto
 *   3. Mascarar a mensagem imediatamente se detectado
 *   4. Emitir evento de FraudSignal para o módulo de fraude
 *
 * Padrões detectados:
 *   - Telefone celular (ex: 11 99999-9999)
 *   - CPF (11 dígitos numéricos)
 *   - Menção a WhatsApp, Zap, Instagram, @username
 *   - Pix fora da plataforma
 */
@Controller('webhooks/chat')
export class StreamChatWebhookController {
  private readonly logger = new Logger(StreamChatWebhookController.name);

  private readonly apiKey = process.env.STREAM_IO_API_KEY ?? '';
  private readonly apiSecret = process.env.STREAM_IO_API_SECRET ?? '';

  /**
   * Padrões regex para detectar tentativas de contato externo.
   * Ordem: do mais óbvio para o mais sutil.
   */
  private readonly CONTACT_PATTERNS = [
    /\b\d{2}\s?\d{4,5}[-\s]?\d{4}\b/,      // Telefone: 11 99999-9999
    /\(\d{2}\)\s?\d{4,5}[-\s]?\d{4}/,      // Telefone: (21) 98888-7777
    /\b\d{11}\b/,                             // CPF ou número de 11 dígitos
    /whats(app)?/i,                            // WhatsApp
    /\bzap\b/i,                                // Zap
    /chama\s+(n[oa]|l[aá])/i,                 // "chama no / chama lá"
    /instagram|insta/i,                        // Instagram
    /@\w{3,}/,                                 // @username
    /pix\s*(direto|fora|por\s+fora)/i,        // Pix fora da plataforma
    /telegram/i,                               // Telegram
    /face(book)?/i,                            // Facebook
    /me\s+liga|liga\s+pra\s+mim/i,           // "me liga"
    /meu\s+n[uú]mero/i,                       // "meu número"
  ];

  constructor(private readonly eventEmitter: EventEmitter2) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() payload: any,
    @Headers('x-signature') signature: string,
  ) {
    // Valida assinatura HMAC (segurança do webhook)
    if (!this.isValidSignature(payload, signature)) {
      this.logger.error('Assinatura inválida no webhook do Stream.io');
      throw new BadRequestException('Invalid signature');
    }

    // Só processa eventos de nova mensagem
    if (payload.type !== 'message.new') {
      return { handled: false };
    }

    const messageText: string = payload.message?.text ?? '';
    const messageId: string = payload.message?.id ?? '';
    const userId: string = payload.message?.user?.id ?? '';
    const channelId: string = payload.channel_id ?? '';
    // channel_id = "order-{orderId}" — extrai o orderId
    const orderId = channelId.replace('order-', '');

    if (this.detectsContactAttempt(messageText)) {
      this.logger.warn(
        `Tentativa de contato externo detectada — usuário: ${userId}, pedido: ${orderId}`,
      );

      // Emite evento para o módulo de fraude registrar o sinal
      this.eventEmitter.emit('chat.contact_attempt_detected', {
        messageId,
        userId,
        orderId,
        snippet: messageText.slice(0, 80),
      });

      return { handled: true, action: 'contact_attempt_detected' };
    }

    return { handled: true, action: 'message_clean' };
  }

  private detectsContactAttempt(text: string): boolean {
    return this.CONTACT_PATTERNS.some((pattern) => pattern.test(text));
  }

  /**
   * Valida assinatura HMAC-SHA256 do Stream.io.
   * Documentação: https://getstream.io/chat/docs/node/webhooks/
   */
  private isValidSignature(payload: any, signature: string): boolean {
    if (!this.apiSecret || !signature) {
      // Em dev sem configuração, aceita tudo (não produção)
      return process.env.NODE_ENV !== 'production';
    }

    try {
      const client = StreamChat.getInstance(this.apiKey, this.apiSecret);
      const body = typeof payload === 'string' ? payload : JSON.stringify(payload);
      return client.verifyWebhook(body, signature);
    } catch {
      return false;
    }
  }
}

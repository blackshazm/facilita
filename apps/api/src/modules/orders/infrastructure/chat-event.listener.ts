import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../../shared-kernel/database/prisma.service';
import { ChatServicePort, CHAT_SERVICE_PORT } from '../ports/chat-service.port';
import { Inject } from '@nestjs/common';

interface ContactAttemptEvent {
  messageId: string;
  userId: string;
  orderId: string;
  snippet: string;
}

interface OrderAcceptedEvent {
  orderId: string;
  customerId: string;
  providerId: string;
}

interface OrderCompletedEvent {
  orderId: string;
}

/**
 * Listener de eventos de chat.
 *
 * Reage a:
 *   - order.accepted     → cria canal de chat para o pedido
 *   - order.completed    → encerra o canal
 *   - chat.contact_attempt_detected → mascara mensagem e registra FraudSignal
 */
@Injectable()
export class ChatEventListener {
  private readonly logger = new Logger(ChatEventListener.name);

  constructor(
    @Inject(CHAT_SERVICE_PORT) private readonly chatService: ChatServicePort,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent('order.accepted')
  async onOrderAccepted(event: OrderAcceptedEvent) {
    this.logger.log(
      `Criando canal de chat para pedido ${event.orderId} (cliente: ${event.customerId}, prestador: ${event.providerId})`,
    );

    try {
      await this.chatService.createOrderChannel(
        event.orderId,
        event.customerId,
        event.providerId,
      );
    } catch (error) {
      this.logger.error(`Falha ao criar canal de chat: ${error.message}`);
    }
  }

  @OnEvent('order.completed')
  async onOrderCompleted(event: OrderCompletedEvent) {
    this.logger.log(`Encerrando canal de chat do pedido ${event.orderId}`);
    try {
      await this.chatService.closeOrderChannel(event.orderId);
    } catch (error) {
      this.logger.error(`Falha ao encerrar canal de chat: ${error.message}`);
    }
  }

  @OnEvent('chat.contact_attempt_detected')
  async onContactAttemptDetected(event: ContactAttemptEvent) {
    this.logger.warn(
      `Contato externo detectado — usuário: ${event.userId}, pedido: ${event.orderId}`,
    );

    try {
      // 1. Mascara a mensagem imediatamente no Stream.io
      await this.chatService.maskMessage(event.messageId);

      // 2. Registra FraudSignal persistente
      await (this.prisma as any).fraudSignal.create({
        data: {
          entityType: 'USER',
          entityId: event.userId,
          signalType: 'PHONE_IN_CHAT',
          severity: 'MEDIUM',
          metadata: {
            orderId: event.orderId,
            messageId: event.messageId,
            snippet: event.snippet,
          },
          reviewed: false,
        },
      });

      this.logger.warn(
        `FraudSignal PHONE_IN_CHAT registrado para usuário ${event.userId}`,
      );
    } catch (error) {
      this.logger.error(`Falha ao processar tentativa de contato: ${error.message}`);
    }
  }
}

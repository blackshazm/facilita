import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { StreamChat } from 'stream-chat';
import {
  ChatChannel,
  ChatServicePort,
  ChatUserToken,
} from '../ports/chat-service.port';

/**
 * Adapter concreto para Stream.io (Stream Chat)
 * Documentação: https://getstream.io/chat/docs/node/
 */
@Injectable()
export class StreamChatAdapter implements ChatServicePort, OnModuleInit {
  private readonly logger = new Logger(StreamChatAdapter.name);
  private client: StreamChat;

  private readonly apiKey = process.env.STREAM_IO_API_KEY ?? '';
  private readonly apiSecret = process.env.STREAM_IO_API_SECRET ?? '';
  private readonly channelType = 'messaging';

  onModuleInit() {
    if (!this.apiKey || !this.apiSecret) {
      this.logger.warn(
        'STREAM_IO_API_KEY ou STREAM_IO_API_SECRET não configurados. Chat desabilitado.',
      );
      return;
    }
    this.client = StreamChat.getInstance(this.apiKey, this.apiSecret);
    this.logger.log('Stream.io Chat inicializado com sucesso.');
  }

  async createOrderChannel(
    orderId: string,
    customerId: string,
    providerId: string,
  ): Promise<ChatChannel> {
    if (!this.client) return this.fallbackChannel(orderId);

    const channelId = `order-${orderId}`;

    await this.upsertUsers([customerId, providerId]);

    const channel = this.client.channel(this.channelType, channelId, {
      members: [customerId, providerId],
      created_by_id: 'system',
      order_id: orderId,
    } as any);

    await channel.create();

    this.logger.log(`Canal de chat criado: ${channelId}`);

    return {
      channelId,
      channelType: this.channelType,
    };
  }

  async generateUserToken(userId: string): Promise<ChatUserToken> {
    if (!this.client) {
      return { userId, token: 'mock-token-stream-not-configured' };
    }

    const expirationTime = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
    const token = this.client.createToken(userId, expirationTime);

    return { userId, token };
  }

  async maskMessage(messageId: string): Promise<void> {
    if (!this.client) return;

    try {
      await this.client.partialUpdateMessage(messageId, {
        set: {
          text: '[CONTEÚDO BLOQUEADO — Contato externo não é permitido no FACILITA]',
          flagged: true,
        } as any,
      });
      this.logger.warn(`Mensagem mascarada por conteúdo suspeito: ${messageId}`);
    } catch (error) {
      this.logger.error(`Erro ao mascarar mensagem ${messageId}: ${error.message}`);
    }
  }

  async closeOrderChannel(orderId: string): Promise<void> {
    if (!this.client) return;

    try {
      const channelId = `order-${orderId}`;
      const channel = this.client.channel(this.channelType, channelId);
      await channel.hide();
      this.logger.log(`Canal de chat encerrado: ${channelId}`);
    } catch (error) {
      this.logger.error(`Erro ao encerrar canal do pedido ${orderId}: ${error.message}`);
    }
  }

  private async upsertUsers(userIds: string[]): Promise<void> {
    await this.client.upsertUsers(
      userIds.map((id) => ({ id, role: 'user' })),
    );
  }

  private fallbackChannel(orderId: string): ChatChannel {
    return {
      channelId: `order-${orderId}`,
      channelType: this.channelType,
    };
  }
}

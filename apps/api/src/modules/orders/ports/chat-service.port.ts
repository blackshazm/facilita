export const CHAT_SERVICE_PORT = 'CHAT_SERVICE_PORT';

export interface ChatChannel {
  channelId: string;
  channelType: string;
}

export interface ChatUserToken {
  userId: string;
  token: string;
}

/**
 * Port para o serviço de chat em tempo real.
 * Implementado pelo StreamChatAdapter (Stream.io).
 */
export interface ChatServicePort {
  /**
   * Cria um canal de chat entre cliente e prestador para um pedido.
   * Chamado quando o prestador aceita um pedido.
   */
  createOrderChannel(
    orderId: string,
    customerId: string,
    providerId: string,
  ): Promise<ChatChannel>;

  /**
   * Gera um token JWT do Stream.io para autenticar um usuário no cliente.
   * Token é válido por 24h.
   */
  generateUserToken(userId: string): Promise<ChatUserToken>;

  /**
   * Mascara uma mensagem suspeita (contato externo detectado).
   */
  maskMessage(messageId: string): Promise<void>;

  /**
   * Desativa o canal de chat ao finalizar o pedido.
   */
  closeOrderChannel(orderId: string): Promise<void>;
}

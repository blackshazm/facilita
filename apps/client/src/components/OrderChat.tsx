'use client';

import { useEffect, useState } from 'react';
import {
  Chat,
  Channel,
  MessageList,
  Window,
  ChannelHeader,
  MessageInput,
} from 'stream-chat-react';
import { StreamChat, Channel as StreamChannel } from 'stream-chat';
import 'stream-chat-react/dist/css/v2/index.css';

interface OrderChatProps {
  orderId: string;
  /** Token JWT do Stream.io gerado pelo backend em GET /orders/:id/chat-token */
  chatToken: string;
  userId: string;
  apiKey: string;
  /** Nome exibido no chat */
  userName?: string;
}

/**
 * Componente de chat em tempo real para o acompanhamento de pedidos.
 *
 * Uso:
 *   const { chatToken, userId, apiKey } = await fetch(`/api/orders/${orderId}/chat-token`)
 *   <OrderChat orderId={orderId} chatToken={chatToken} userId={userId} apiKey={apiKey} />
 */
export function OrderChat({
  orderId,
  chatToken,
  userId,
  apiKey,
  userName,
}: OrderChatProps) {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<StreamChannel | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiKey || !userId || !chatToken) return;

    const streamClient = StreamChat.getInstance(apiKey);

    const connect = async () => {
      try {
        await streamClient.connectUser(
          { id: userId, name: userName ?? userId },
          chatToken,
        );

        const orderChannel = streamClient.channel('messaging', `order-${orderId}`);
        await orderChannel.watch();

        setClient(streamClient);
        setChannel(orderChannel);
      } catch (err: any) {
        setError(`Erro ao conectar ao chat: ${err.message}`);
      }
    };

    connect();

    // Cleanup: desconecta ao desmontar
    return () => {
      streamClient.disconnectUser();
    };
  }, [orderId, chatToken, userId, apiKey, userName]);

  if (error) {
    return (
      <div className="chat-error">
        <p>⚠️ {error}</p>
      </div>
    );
  }

  if (!client || !channel) {
    return (
      <div className="chat-loading">
        <div className="chat-loading-spinner" />
        <p>Conectando ao chat...</p>
      </div>
    );
  }

  return (
    <div className="order-chat-wrapper">
      <Chat client={client} theme="str-chat__theme-dark">
        <Channel channel={channel}>
          <Window>
            <ChannelHeader />
            <MessageList />
            <MessageInput focus />
          </Window>
        </Channel>
      </Chat>
    </div>
  );
}

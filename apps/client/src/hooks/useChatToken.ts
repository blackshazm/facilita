'use client';

import { useState, useEffect, useCallback } from 'react';

interface ChatTokenData {
  userId: string;
  token: string;
  channelId: string;
  channelType: string;
  apiKey: string;
}

interface UseChatTokenResult {
  data: ChatTokenData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333';

/**
 * Hook para buscar o token de autenticação do Stream.io para um pedido.
 *
 * Exemplo:
 *   const { data, isLoading } = useChatToken(orderId, authToken);
 *   if (data) {
 *     return <OrderChat {...data} orderId={orderId} />
 *   }
 */
export function useChatToken(
  orderId: string | null,
  authToken: string | null,
): UseChatTokenResult {
  const [data, setData] = useState<ChatTokenData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  const refetch = useCallback(() => setTrigger((t) => t + 1), []);

  useEffect(() => {
    if (!orderId || !authToken) return;

    setIsLoading(true);
    setError(null);

    fetch(`${API_URL}/orders/${orderId}/chat-token`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => setData(json))
      .catch((err) => setError(`Não foi possível carregar o chat: ${err.message}`))
      .finally(() => setIsLoading(false));
  }, [orderId, authToken, trigger]);

  return { data, isLoading, error, refetch };
}

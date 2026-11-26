import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { StorageService } from './StorageService';

export type QueuedActionType =
  | 'CHECK_IN'
  | 'START_ORDER'
  | 'ADD_EVIDENCE'
  | 'COMPLETE_ORDER'
  | 'ADDITIONAL_REQUEST'
  | 'RESPOND_ADDITIONAL';

export interface QueuedAction {
  id: string;
  type: QueuedActionType;
  orderId: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH';
  payload?: any;
  createdAt: string;
  attempts: number;
}

const QUEUE_STORAGE_KEY = '@facilita/offline_action_queue';

let isProcessing = false;

export const OfflineQueueService = {
  /**
   * Enfileira uma ação para sincronização posterior
   */
  async enqueue(
    action: Omit<QueuedAction, 'id' | 'createdAt' | 'attempts'>
  ): Promise<QueuedAction> {
    const queue = await this.getQueue();
    const newAction: QueuedAction = {
      ...action,
      id: `q_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      createdAt: new Date().toISOString(),
      attempts: 0,
    };

    queue.push(newAction);
    await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    console.log(`[OfflineQueue] Ação enfileirada: ${newAction.type} (${newAction.id})`);
    return newAction;
  },

  /**
   * Retorna a lista atual de ações pendentes
   */
  async getQueue(): Promise<QueuedAction[]> {
    try {
      const data = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('[OfflineQueue] Erro ao ler fila do AsyncStorage', e);
      return [];
    }
  },

  /**
   * Remove uma ação processada da fila
   */
  async remove(actionId: string): Promise<void> {
    try {
      const queue = await this.getQueue();
      const updated = queue.filter((item) => item.id !== actionId);
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('[OfflineQueue] Erro ao remover ação da fila', e);
    }
  },

  /**
   * Limpa todas as ações da fila
   */
  async clearQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(QUEUE_STORAGE_KEY);
    } catch (e) {
      console.error('[OfflineQueue] Erro ao limpar fila', e);
    }
  },

  /**
   * Processa todos os itens da fila em ordem FIFO
   */
  async processQueue(apiUrl: string): Promise<{ processed: number; failed: number }> {
    if (isProcessing) {
      return { processed: 0, failed: 0 };
    }

    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      console.log('[OfflineQueue] Dispositivo ainda sem conexão. Sincronização adiada.');
      return { processed: 0, failed: 0 };
    }

    const queue = await this.getQueue();
    if (queue.length === 0) {
      return { processed: 0, failed: 0 };
    }

    isProcessing = true;
    let processed = 0;
    let failed = 0;

    console.log(`[OfflineQueue] Iniciando sincronização de ${queue.length} ações pendentes...`);

    try {
      const profile = await StorageService.getProfile();
      const token = profile?.token;

      for (const item of queue) {
        try {
          const url = `${apiUrl}${item.endpoint.startsWith('/') ? item.endpoint : `/${item.endpoint}`}`;
          const res = await fetch(url, {
            method: item.method,
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            ...(item.payload ? { body: JSON.stringify(item.payload) } : {}),
          });

          if (res.ok || res.status === 409) {
            // Sucesso ou conflito já resolvido (idempotência)
            await this.remove(item.id);
            processed++;
            console.log(`[OfflineQueue] Ação ${item.type} (${item.id}) sincronizada.`);
          } else {
            console.warn(`[OfflineQueue] Falha HTTP (${res.status}) na ação ${item.id}`);
            failed++;
          }
        } catch (itemErr) {
          console.warn(`[OfflineQueue] Erro de rede na ação ${item.id}:`, itemErr);
          failed++;
          break; // Se deu erro de rede, interrompe o loop para tentar novamente quando o sinal estabilizar
        }
      }
    } finally {
      isProcessing = false;
    }

    console.log(`[OfflineQueue] Sincronização concluída: ${processed} processadas, ${failed} com falha.`);
    return { processed, failed };
  },

  /**
   * Inicializa o ouvinte de rede para processar automaticamente ao reconectar
   */
  initAutoSync(
    apiUrl: string,
    onSyncComplete?: (result: { processed: number; failed: number }) => void
  ): () => void {
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      if (state.isConnected && state.isInternetReachable !== false) {
        const result = await this.processQueue(apiUrl);
        if (result.processed > 0 && onSyncComplete) {
          onSyncComplete(result);
        }
      }
    });

    return unsubscribe;
  },
};

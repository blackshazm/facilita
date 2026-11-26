import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// 1. Mock do AsyncStorage em memória
const storageMap = new Map();
const mockAsyncStorage = {
  getItem: async (key) => storageMap.get(key) || null,
  setItem: async (key, val) => { storageMap.set(key, val); },
  removeItem: async (key) => { storageMap.delete(key); },
  clear: async () => { storageMap.clear(); },
};

// 2. Mock do NetInfo
let isConnectedState = true;
const mockNetInfo = {
  fetch: async () => ({ isConnected: isConnectedState, isInternetReachable: isConnectedState }),
  addEventListener: (cb) => () => {},
};

// 3. Mock do StorageService
const mockStorageService = {
  getProfile: async () => ({ token: 'mock-jwt-token', id: 'prov-1' }),
};

// 4. Implementação isolada de teste da lógica idêntica do OfflineQueueService
const QUEUE_STORAGE_KEY = '@facilita/offline_action_queue';
let isProcessing = false;

const OfflineQueueServiceTestable = {
  async enqueue(action) {
    const queue = await this.getQueue();
    const newAction = {
      ...action,
      id: `q_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      createdAt: new Date().toISOString(),
      attempts: 0,
    };
    queue.push(newAction);
    await mockAsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    return newAction;
  },

  async getQueue() {
    const data = await mockAsyncStorage.getItem(QUEUE_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  async remove(actionId) {
    const queue = await this.getQueue();
    const updated = queue.filter((item) => item.id !== actionId);
    await mockAsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(updated));
  },

  async clearQueue() {
    await mockAsyncStorage.removeItem(QUEUE_STORAGE_KEY);
  },

  async processQueue(apiUrl, customFetch) {
    if (isProcessing) return { processed: 0, failed: 0 };

    const netState = await mockNetInfo.fetch();
    if (!netState.isConnected) {
      return { processed: 0, failed: 0 };
    }

    const queue = await this.getQueue();
    if (queue.length === 0) {
      return { processed: 0, failed: 0 };
    }

    isProcessing = true;
    let processed = 0;
    let failed = 0;

    try {
      const profile = await mockStorageService.getProfile();
      const token = profile?.token;

      for (const item of queue) {
        try {
          const url = `${apiUrl}${item.endpoint.startsWith('/') ? item.endpoint : `/${item.endpoint}`}`;
          const res = await customFetch(url, {
            method: item.method,
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            ...(item.payload ? { body: JSON.stringify(item.payload) } : {}),
          });

          if (res.ok || res.status === 409) {
            await this.remove(item.id);
            processed++;
          } else {
            failed++;
          }
        } catch {
          failed++;
          break; // Conexão oscilou, para a fila para evitar perda de ordem
        }
      }
    } finally {
      isProcessing = false;
    }

    return { processed, failed };
  },
};

describe('OfflineQueueService — Resiliência Mobile do Prestador', () => {
  beforeEach(async () => {
    storageMap.clear();
    isConnectedState = true;
    isProcessing = false;
  });

  test('deve enfileirar ações de início e conclusão quando o app estiver offline', async () => {
    const action1 = await OfflineQueueServiceTestable.enqueue({
      type: 'START_ORDER',
      orderId: 'ord-offline-1',
      endpoint: '/orders/ord-offline-1/start',
      method: 'POST',
      payload: { photoUrl: 'file:///photo_before.jpg' },
    });

    const action2 = await OfflineQueueServiceTestable.enqueue({
      type: 'COMPLETE_ORDER',
      orderId: 'ord-offline-1',
      endpoint: '/orders/ord-offline-1/complete',
      method: 'POST',
      payload: { photoUrl: 'file:///photo_after.jpg' },
    });

    const queue = await OfflineQueueServiceTestable.getQueue();
    assert.equal(queue.length, 2);
    assert.equal(queue[0].type, 'START_ORDER');
    assert.equal(queue[1].type, 'COMPLETE_ORDER');
    assert.equal(action1.orderId, 'ord-offline-1');
    assert.equal(action2.orderId, 'ord-offline-1');
  });

  test('não deve processar ações se o dispositivo ainda estiver sem conexão', async () => {
    isConnectedState = false; // Sem sinal 4G
    await OfflineQueueServiceTestable.enqueue({
      type: 'CHECK_IN',
      orderId: 'ord-no-signal',
      endpoint: '/orders/ord-no-signal/check-in',
      method: 'POST',
    });

    const customFetch = async () => { throw new Error('Deveria ser impedido por falta de sinal'); };
    const result = await OfflineQueueServiceTestable.processQueue('http://api.facilita.com', customFetch);

    assert.equal(result.processed, 0);
    assert.equal(result.failed, 0);

    const queue = await OfflineQueueServiceTestable.getQueue();
    assert.equal(queue.length, 1, 'A ação deve continuar persistida no AsyncStorage');
  });

  test('deve processar fila com sucesso (HTTP 200) e aceitar HTTP 409 como idempotência resolvida', async () => {
    isConnectedState = true;

    await OfflineQueueServiceTestable.enqueue({
      type: 'START_ORDER',
      orderId: 'ord-200',
      endpoint: '/orders/ord-200/start',
      method: 'POST',
    });

    await OfflineQueueServiceTestable.enqueue({
      type: 'COMPLETE_ORDER',
      orderId: 'ord-409',
      endpoint: '/orders/ord-409/complete',
      method: 'POST',
    });

    const customFetch = async (url) => {
      if (url.includes('ord-200')) {
        return { ok: true, status: 200 };
      }
      if (url.includes('ord-409')) {
        // Pedido já foi concluído anteriormente no backend
        return { ok: false, status: 409 };
      }
      return { ok: false, status: 500 };
    };

    const result = await OfflineQueueServiceTestable.processQueue('http://api.facilita.com', customFetch);

    assert.equal(result.processed, 2, 'Tanto 200 quanto 409 devem ser considerados sincronizados');
    assert.equal(result.failed, 0);

    const remaining = await OfflineQueueServiceTestable.getQueue();
    assert.equal(remaining.length, 0, 'A fila local deve ficar vazia após a sincronização');
  });

  test('deve interromper o loop e reter itens se houver queda de rede no meio do processo', async () => {
    isConnectedState = true;

    await OfflineQueueServiceTestable.enqueue({
      type: 'CHECK_IN',
      orderId: 'ord-ok',
      endpoint: '/orders/ord-ok/check-in',
      method: 'POST',
    });

    await OfflineQueueServiceTestable.enqueue({
      type: 'START_ORDER',
      orderId: 'ord-fail',
      endpoint: '/orders/ord-fail/start',
      method: 'POST',
    });

    let calls = 0;
    const customFetch = async (url) => {
      calls++;
      if (url.includes('ord-ok')) {
        return { ok: true, status: 200 };
      }
      throw new Error('Network request failed'); // Sinal caiu
    };

    const result = await OfflineQueueServiceTestable.processQueue('http://api.facilita.com', customFetch);

    assert.equal(result.processed, 1, 'Primeiro item sincronizado com sucesso');
    assert.equal(result.failed, 1, 'Segundo item falhou por queda de rede');

    const remaining = await OfflineQueueServiceTestable.getQueue();
    assert.equal(remaining.length, 1, 'O item que falhou deve continuar seguro na fila local');
    assert.equal(remaining[0].orderId, 'ord-fail');
  });
});

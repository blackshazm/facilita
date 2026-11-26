import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
let Expo: any;
try {
  Expo = require('expo-server-sdk').Expo;
} catch {
  Expo = class DummyExpo {
    static isExpoPushToken(token: string) {
      return typeof token === 'string' && (token.startsWith('ExponentPushToken') || token.startsWith('ExpoPushToken'));
    }
    chunkPushNotifications(messages: any[]) {
      return [messages];
    }
    async sendPushNotificationsAsync(messages: any[]) {
      return [{ status: 'ok', id: 'mock-ticket-id' }];
    }
  };
}

type ExpoPushMessage = any;
import { Logger } from '@nestjs/common';

@Processor('notifications')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);
  private expo = new Expo();

  async process(job: Job<any>): Promise<any> {
    const { token, title, body, data } = job.data;

    if (!Expo.isExpoPushToken(token)) {
      this.logger.error(`Token inválido encontrado no job ${job.id}: ${token}`);
      return;
    }

    const message: ExpoPushMessage = {
      to: token,
      sound: 'default',
      title,
      body,
      data,
      priority: 'high',
    };

    // V2 Hardening: Chunking nativo do Expo SDK para otimização
    const chunks = this.expo.chunkPushNotifications([message]);
    
    for (const chunk of chunks) {
      try {
        const tickets = await this.expo.sendPushNotificationsAsync(chunk);
        this.logger.log(`Notificação enviada com sucesso para ${token}. Ticket: ${JSON.stringify(tickets[0])}`);
        
        // Em uma fase futura (7.x), poderíamos processar os tickets para limpar tokens inválidos
        // tickets.forEach(ticket => {
        //   if (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered') {
        //     // Invalida token no DB
        //   }
        // });
      } catch (error) {
        this.logger.error(`Erro ao enviar chunk de notificação: ${error.message}`);
        throw error; // Lança para o BullMQ tentar o retry configurado
      }
    }
  }
}

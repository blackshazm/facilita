import { StreamChatWebhookController } from '../infrastructure/stream-chat-webhook.controller';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';

describe('StreamChatWebhookController', () => {
  let controller: StreamChatWebhookController;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot()],
      controllers: [StreamChatWebhookController],
    }).compile();

    controller = module.get<StreamChatWebhookController>(StreamChatWebhookController);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  describe('Detecção de contato externo', () => {
    // Acessa método privado para teste unitário
    const detectContact = (controller: any, text: string) =>
      controller.detectsContactAttempt(text);

    it('detecta número de telefone celular', () => {
      expect(detectContact(controller, 'me chama no 11 99999-9999')).toBe(true);
      expect(detectContact(controller, 'ligo no (21) 98888-7777')).toBe(true);
    });

    it('detecta menção a WhatsApp', () => {
      expect(detectContact(controller, 'me chama no whatsapp')).toBe(true);
      expect(detectContact(controller, 'me manda no zap')).toBe(true);
    });

    it('detecta menção a Instagram', () => {
      expect(detectContact(controller, 'segue meu instagram')).toBe(true);
      expect(detectContact(controller, 'meu insta é @joao')).toBe(true);
    });

    it('detecta menção de @username', () => {
      expect(detectContact(controller, 'me acha no @usuario123')).toBe(true);
    });

    it('detecta pix fora da plataforma', () => {
      expect(detectContact(controller, 'me manda pix direto')).toBe(true);
      expect(detectContact(controller, 'pode mandar pix fora')).toBe(true);
    });

    it('não bloqueia mensagens normais do serviço', () => {
      expect(detectContact(controller, 'Estou chegando em 10 minutos')).toBe(false);
      expect(detectContact(controller, 'O problema está na tomada do quarto')).toBe(false);
      expect(detectContact(controller, 'Preciso de mais 2 metros de fio')).toBe(false);
      expect(detectContact(controller, 'Serviço concluído!')).toBe(false);
    });
  });

  describe('handleWebhook', () => {
    it('ignora eventos que não são message.new', async () => {
      const result = await controller.handleWebhook(
        { type: 'user.connected' },
        'valid-signature',
      );
      expect(result).toEqual({ handled: false });
    });

    it('emite evento quando detecta contato externo em mensagem nova', async () => {
      const emitSpy = jest.spyOn(eventEmitter, 'emit');

      const payload = {
        type: 'message.new',
        channel_id: 'order-abc-123',
        message: {
          id: 'msg-1',
          text: 'me chama no whatsapp',
          user: { id: 'user-42' },
        },
      };

      const result = await controller.handleWebhook(payload, '');
      expect(result.action).toBe('contact_attempt_detected');
      expect(emitSpy).toHaveBeenCalledWith(
        'chat.contact_attempt_detected',
        expect.objectContaining({
          messageId: 'msg-1',
          userId: 'user-42',
          orderId: 'abc-123',
        }),
      );
    });

    it('processa mensagem limpa sem emitir evento', async () => {
      const emitSpy = jest.spyOn(eventEmitter, 'emit');

      const payload = {
        type: 'message.new',
        channel_id: 'order-xyz-456',
        message: {
          id: 'msg-2',
          text: 'Estou chegando!',
          user: { id: 'user-99' },
        },
      };

      const result = await controller.handleWebhook(payload, '');
      expect(result.action).toBe('message_clean');
      expect(emitSpy).not.toHaveBeenCalled();
    });
  });
});

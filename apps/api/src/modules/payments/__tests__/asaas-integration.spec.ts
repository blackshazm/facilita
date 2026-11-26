import { AsaasAdapter } from '../infrastructure/gateways/asaas.adapter';
import { AsaasPayoutAdapter } from '../infrastructure/gateways/asaas-payout.adapter';
import { AsaasWebhookController, verifyAsaasWebhookToken } from '../interface/http/asaas.webhook.controller';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

describe('Asaas Payment & Payout Gateway Integration', () => {
  describe('verifyAsaasWebhookToken (Timing Attack Defense)', () => {
    const validSecret = 'whsec_facilita_local_secret_2026';

    it('deve aprovar quando o token recebido for idêntico ao esperado', () => {
      const isValid = verifyAsaasWebhookToken(validSecret, validSecret);
      expect(isValid).toBe(true);
    });

    it('deve rejeitar quando os tokens tiverem tamanhos diferentes', () => {
      const isValid = verifyAsaasWebhookToken('token_curto', validSecret);
      expect(isValid).toBe(false);
    });

    it('deve rejeitar quando os tokens tiverem mesmo tamanho mas caracteres diferentes', () => {
      const forged = 'whsec_facilita_local_secret_9999';
      const isValid = verifyAsaasWebhookToken(forged, validSecret);
      expect(isValid).toBe(false);
    });

    it('deve rejeitar tokens nulos ou indefinidos', () => {
      expect(verifyAsaasWebhookToken(null, validSecret)).toBe(false);
      expect(verifyAsaasWebhookToken(undefined, validSecret)).toBe(false);
      expect(verifyAsaasWebhookToken(validSecret, null)).toBe(false);
    });
  });

  describe('AsaasAdapter (PaymentGatewayPort)', () => {
    let adapter: AsaasAdapter;

    beforeEach(() => {
      process.env.ASAAS_API_KEY = 'test_mock_key';
      adapter = new AsaasAdapter();
    });

    it('deve gerar cobrança PIX com status PENDING, QRCode e Chave Copia-e-Cola', async () => {
      const result = await adapter.authorize({
        orderId: 'ord-12345',
        amount: 15000, // R$ 150,00
        customerId: 'cus-client-1',
        paymentMethod: 'PIX',
      });

      expect(result.externalId).toBeDefined();
      expect(result.status).toBe('PENDING');
      expect(result.pixQrCode).toBeDefined();
      expect(result.pixCopiaECola).toContain('ord-12345');
      expect(result.invoiceUrl).toContain('ord-12345');
    });

    it('deve processar cobrança via Cartão de Crédito', async () => {
      const result = await adapter.authorize({
        orderId: 'ord-card-99',
        amount: 20000,
        customerId: 'cus-client-2',
        paymentMethod: 'CARD',
        cardToken: 'tok_card_test_123',
      });

      expect(result.externalId).toBeDefined();
      expect(result.status).toBe('PAID');
    });

    it('deve capturar cobrança com sucesso', async () => {
      const result = await adapter.capture('pay_mock_123', 15000);
      expect(result.status).toBe('PAID');
    });

    it('deve processar estorno com sucesso', async () => {
      const result = await adapter.refund('pay_mock_123', 15000);
      expect(result.status).toBe('REFUNDED');
    });
  });

  describe('AsaasPayoutAdapter (PayoutPort)', () => {
    let payoutAdapter: AsaasPayoutAdapter;

    beforeEach(() => {
      process.env.ASAAS_API_KEY = 'test_mock_key';
      payoutAdapter = new AsaasPayoutAdapter();
    });

    it('deve transferir valor via PIX para o prestador com cálculo de taxa', async () => {
      const result = await payoutAdapter.transfer({
        providerId: 'prov-456',
        recipientId: '11999998888',
        amount: 8500n, // R$ 85,00
        idempotencyKey: 'idem-payout-1',
        metadata: { pixKey: '11999998888', pixKeyType: 'PHONE' },
      });

      expect(result.externalId).toBeDefined();
      expect(result.status).toBe('PAID');
      expect(result.fee).toBe(99n); // Taxa PIX em centavos
    });

    it('deve consultar saldo disponível da conta em centavos', async () => {
      const balance = await payoutAdapter.getBalance('prov-456');
      expect(balance).toBe(1000000n); // R$ 10.000,00 simulados
    });
  });

  describe('AsaasWebhookController', () => {
    let controller: AsaasWebhookController;
    let mockPrisma: any;
    let mockCapturePayment: any;
    let mockEventEmitter: any;

    beforeEach(() => {
      process.env.ASAAS_WEBHOOK_SECRET = 'whsec_facilita_local_secret_2026';

      mockPrisma = {
        processedWebhook: {
          findUnique: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({ id: 'wh-1' }),
        },
        payment: {
          findFirst: jest.fn().mockResolvedValue({ id: 'pay-1', orderId: 'ord-100', status: 'PENDING' }),
          update: jest.fn().mockResolvedValue({ id: 'pay-1', status: 'PAID' }),
          updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
        order: {
          findUnique: jest.fn().mockResolvedValue({ id: 'ord-100', providerId: 'prov-200' }),
        },
      };

      mockCapturePayment = {
        execute: jest.fn().mockResolvedValue(undefined),
      };

      mockEventEmitter = {
        emit: jest.fn(),
      };

      controller = new AsaasWebhookController(mockPrisma, mockCapturePayment, mockEventEmitter);
    });

    it('deve rejeitar requisição com token de webhook inválido lançando 401 Unauthorized', async () => {
      await expect(
        controller.handleAsaasWebhook({}, { id: 'evt-1', event: 'PAYMENT_RECEIVED' }, 'token_invalido')
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve rejeitar payload malformado lançando 400 BadRequestException', async () => {
      await expect(
        controller.handleAsaasWebhook({}, {}, 'whsec_facilita_local_secret_2026')
      ).rejects.toThrow(BadRequestException);
    });

    it('deve ignorar eventos duplicados via idempotência', async () => {
      mockPrisma.processedWebhook.findUnique.mockResolvedValueOnce({ id: 'wh-existing', eventId: 'evt-dup' });

      const res = await controller.handleAsaasWebhook(
        {},
        { id: 'evt-dup', event: 'PAYMENT_RECEIVED' },
        'whsec_facilita_local_secret_2026'
      );

      expect(res).toEqual({ received: true, duplicate: true });
      expect(mockPrisma.processedWebhook.create).not.toHaveBeenCalled();
    });

    it('deve processar PAYMENT_CONFIRMED, atualizar pagamento e emitir order.paid', async () => {
      const payload = {
        id: 'evt-confirmed-1',
        event: 'PAYMENT_CONFIRMED',
        payment: {
          id: 'pay_asaas_777',
          externalReference: 'ord-100',
          value: 120.0,
        },
      };

      const res = await controller.handleAsaasWebhook(
        {},
        payload,
        'whsec_facilita_local_secret_2026'
      );

      expect(res.received).toBe(true);
      expect(mockPrisma.payment.update).toHaveBeenCalledWith({
        where: { id: 'pay-1' },
        data: {
          status: 'PAID',
          externalId: 'pay_asaas_777',
        },
      });
      expect(mockCapturePayment.execute).toHaveBeenCalledWith('ord-100', 'prov-200');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('order.paid', expect.objectContaining({
        orderId: 'ord-100',
        externalId: 'pay_asaas_777',
      }));
    });
  });
});

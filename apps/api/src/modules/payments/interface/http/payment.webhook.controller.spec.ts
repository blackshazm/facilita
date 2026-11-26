import { Test, TestingModule } from '@nestjs/testing';
import { PaymentWebhookController } from './payment.webhook.controller';
import { CapturePaymentUseCase } from '../../application/capture-payment.usecase';
import { ProcessPayoutWebhookUseCase } from '../../application/process-payout-webhook.usecase';
import { PrismaService } from '../../../../shared-kernel/database/prisma.service';

describe('PaymentWebhookController', () => {
  let controller: PaymentWebhookController;
  let prismaService: any;
  let processPayoutWebhook: any;

  beforeEach(async () => {
    prismaService = {
      processedWebhook: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    processPayoutWebhook = {
      execute: jest.fn().mockResolvedValue({ processed: true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentWebhookController],
      providers: [
        { provide: CapturePaymentUseCase, useValue: { execute: jest.fn() } },
        { provide: ProcessPayoutWebhookUseCase, useValue: processPayoutWebhook },
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    controller = module.get<PaymentWebhookController>(PaymentWebhookController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should skip processing and return duplicate: true if webhook event was already processed', async () => {
    prismaService.processedWebhook.findUnique.mockResolvedValue({
      eventId: 'evt_dup_123',
      provider: 'PAGARME',
      processedAt: new Date(),
    });

    const result = await controller.handlePagarMeWebhook(
      { rawBody: '{"id":"evt_dup_123"}' },
      { id: 'evt_dup_123', type: 'transfer.paid' },
      'valid_sig',
    );

    expect(result).toEqual({ received: true, duplicate: true });
    expect(processPayoutWebhook.execute).not.toHaveBeenCalled();
    expect(prismaService.processedWebhook.create).not.toHaveBeenCalled();
  });

  it('should record event in ProcessedWebhook and process payout webhook on new event', async () => {
    prismaService.processedWebhook.findUnique.mockResolvedValue(null);
    prismaService.processedWebhook.create.mockResolvedValue({
      eventId: 'evt_new_456',
      provider: 'PAGARME',
      processedAt: new Date(),
    });

    const result = await controller.handlePagarMeWebhook(
      { rawBody: '{"id":"evt_new_456"}' },
      { id: 'evt_new_456', type: 'transfer.paid' },
      'valid_sig',
    );

    expect(prismaService.processedWebhook.findUnique).toHaveBeenCalledWith({
      where: { eventId: 'evt_new_456' },
    });
    expect(prismaService.processedWebhook.create).toHaveBeenCalledWith({
      data: { eventId: 'evt_new_456', provider: 'PAGARME' },
    });
    expect(processPayoutWebhook.execute).toHaveBeenCalled();
    expect(result).toEqual({ processed: true });
  });
});

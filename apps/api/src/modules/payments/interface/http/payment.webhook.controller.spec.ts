import { Test, TestingModule } from '@nestjs/testing';
import { PaymentWebhookController } from './payment.webhook.controller';

describe('PaymentWebhookController', () => {
  let provider: PaymentWebhookController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentWebhookController,
        // TODO: Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<PaymentWebhookController>(PaymentWebhookController);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProcessPayoutWebhookUseCase } from '../application/process-payout-webhook.usecase';
import { PayoutStatus, PayoutProps } from '../ports/payout-repository.port';

describe('ProcessPayoutWebhookUseCase', () => {
  let useCase: ProcessPayoutWebhookUseCase;
  let payoutRepo: any;
  let eventEmitter: any;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(async () => {
    originalEnv = { ...process.env };
    
    payoutRepo = {
      save: jest.fn(),
      findByExternalId: jest.fn(),
    };

    eventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessPayoutWebhookUseCase,
        { provide: 'PayoutRepositoryPort', useValue: payoutRepo },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    useCase = module.get<ProcessPayoutWebhookUseCase>(ProcessPayoutWebhookUseCase);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should throw UnauthorizedException if signature is invalid and not in mock mode', async () => {
    process.env.PAGARME_SECRET_KEY = 'real_secret_key';
    process.env.PAGARME_WEBHOOK_SECRET = 'webhook_secret';

    const rawBody = Buffer.from(JSON.stringify({ type: 'transfer.transferred' }));
    const badSignature = 'invalid_signature';

    await expect(
      useCase.execute(rawBody, badSignature, { type: 'transfer.transferred' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should bypass signature check if PAGARME_SECRET_KEY is sk_test_mock', async () => {
    process.env.PAGARME_SECRET_KEY = 'sk_test_mock';
    
    const rawBody = Buffer.from(JSON.stringify({ type: 'transfer.transferred' }));
    const mockPayout: PayoutProps = {
      id: 'payout_1',
      providerId: 'prov_123',
      amount: 1000n,
      fee: 10n,
      status: PayoutStatus.PROCESSING,
      externalId: 'tr_123',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    payoutRepo.findByExternalId.mockResolvedValue(mockPayout);

    const result = await useCase.execute(rawBody, 'any_signature', {
      type: 'transfer.transferred',
      data: { id: 'tr_123' },
    });

    expect(result.received).toBe(true);
    expect(payoutRepo.findByExternalId).toHaveBeenCalledWith('tr_123');
    expect(mockPayout.status).toBe(PayoutStatus.PAID);
    expect(payoutRepo.save).toHaveBeenCalledWith(mockPayout);
  });

  it('should short-circuit with received: true if payout is already in a terminal state (PAID)', async () => {
    process.env.PAGARME_SECRET_KEY = 'sk_test_mock';
    
    const mockPayout: PayoutProps = {
      id: 'payout_1',
      providerId: 'prov_123',
      amount: 1000n,
      fee: 10n,
      status: PayoutStatus.PAID,
      externalId: 'tr_123',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    payoutRepo.findByExternalId.mockResolvedValue(mockPayout);

    const result = await useCase.execute(Buffer.from(''), 'sig', {
      type: 'transfer.transferred',
      data: { id: 'tr_123' },
    });

    expect(result.received).toBe(true);
    expect(payoutRepo.save).not.toHaveBeenCalled();
    expect(eventEmitter.emit).not.toHaveBeenCalled();
  });

  it('should short-circuit with received: true if payout is already in a terminal state (FAILED)', async () => {
    process.env.PAGARME_SECRET_KEY = 'sk_test_mock';
    
    const mockPayout: PayoutProps = {
      id: 'payout_1',
      providerId: 'prov_123',
      amount: 1000n,
      fee: 10n,
      status: PayoutStatus.FAILED,
      externalId: 'tr_123',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    payoutRepo.findByExternalId.mockResolvedValue(mockPayout);

    const result = await useCase.execute(Buffer.from(''), 'sig', {
      type: 'transfer.failed',
      data: { id: 'tr_123' },
    });

    expect(result.received).toBe(true);
    expect(payoutRepo.save).not.toHaveBeenCalled();
    expect(eventEmitter.emit).not.toHaveBeenCalled();
  });

  it('should update status to PROCESSING when event is transfer.processing', async () => {
    process.env.PAGARME_SECRET_KEY = 'sk_test_mock';
    
    const mockPayout: PayoutProps = {
      id: 'payout_1',
      providerId: 'prov_123',
      amount: 1000n,
      fee: 10n,
      status: PayoutStatus.PENDING,
      externalId: 'tr_123',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    payoutRepo.findByExternalId.mockResolvedValue(mockPayout);

    const result = await useCase.execute(Buffer.from(''), 'sig', {
      type: 'transfer.processing',
      data: { id: 'tr_123' },
    });

    expect(result.received).toBe(true);
    expect(mockPayout.status).toBe(PayoutStatus.PROCESSING);
    expect(payoutRepo.save).toHaveBeenCalledWith(mockPayout);
    expect(eventEmitter.emit).not.toHaveBeenCalled();
  });

  it('should update status to PAID when event is transfer.transferred', async () => {
    process.env.PAGARME_SECRET_KEY = 'sk_test_mock';
    
    const mockPayout: PayoutProps = {
      id: 'payout_1',
      providerId: 'prov_123',
      amount: 1000n,
      fee: 10n,
      status: PayoutStatus.PROCESSING,
      externalId: 'tr_123',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    payoutRepo.findByExternalId.mockResolvedValue(mockPayout);

    const result = await useCase.execute(Buffer.from(''), 'sig', {
      type: 'transfer.transferred',
      data: { id: 'tr_123' },
    });

    expect(result.received).toBe(true);
    expect(mockPayout.status).toBe(PayoutStatus.PAID);
    expect(payoutRepo.save).toHaveBeenCalledWith(mockPayout);
    expect(eventEmitter.emit).not.toHaveBeenCalled();
  });

  it('should update status to FAILED and emit payout.failed event when transfer.failed occurs', async () => {
    process.env.PAGARME_SECRET_KEY = 'sk_test_mock';
    
    const mockPayout: PayoutProps = {
      id: 'payout_1',
      providerId: 'prov_123',
      amount: 1000n,
      fee: 10n,
      status: PayoutStatus.PROCESSING,
      externalId: 'tr_123',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    payoutRepo.findByExternalId.mockResolvedValue(mockPayout);

    const result = await useCase.execute(Buffer.from(''), 'sig', {
      type: 'transfer.failed',
      data: { id: 'tr_123' },
    });

    expect(result.received).toBe(true);
    expect(mockPayout.status).toBe(PayoutStatus.FAILED);
    expect(payoutRepo.save).toHaveBeenCalledWith(mockPayout);
    
    expect(eventEmitter.emit).toHaveBeenCalledWith('payout.failed', {
      payoutId: 'payout_1',
      providerId: 'prov_123',
      amount: '1000',
    });
  });

  it('should update status to FAILED and emit payout.failed event when transfer.canceled occurs', async () => {
    process.env.PAGARME_SECRET_KEY = 'sk_test_mock';
    
    const mockPayout: PayoutProps = {
      id: 'payout_2',
      providerId: 'prov_456',
      amount: 5000n,
      fee: 50n,
      status: PayoutStatus.PROCESSING,
      externalId: 'tr_456',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    payoutRepo.findByExternalId.mockResolvedValue(mockPayout);

    const result = await useCase.execute(Buffer.from(''), 'sig', {
      type: 'transfer.canceled',
      data: { id: 'tr_456' },
    });

    expect(result.received).toBe(true);
    expect(mockPayout.status).toBe(PayoutStatus.FAILED);
    expect(payoutRepo.save).toHaveBeenCalledWith(mockPayout);
    
    expect(eventEmitter.emit).toHaveBeenCalledWith('payout.failed', {
      payoutId: 'payout_2',
      providerId: 'prov_456',
      amount: '5000',
    });
  });

  it('should ignore non-transfer events and return received: false', async () => {
    process.env.PAGARME_SECRET_KEY = 'sk_test_mock';

    const result = await useCase.execute(Buffer.from(''), 'sig', {
      type: 'charge.paid',
      data: { id: 'ch_123' },
    });

    expect(result.received).toBe(false);
    expect(payoutRepo.findByExternalId).not.toHaveBeenCalled();
    expect(payoutRepo.save).not.toHaveBeenCalled();
    expect(eventEmitter.emit).not.toHaveBeenCalled();
  });
});

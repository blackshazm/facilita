import { Test, TestingModule } from '@nestjs/testing';
import { CapturePaymentUseCase } from './capture-payment.usecase';
import { PAYMENT_GATEWAY_PORT } from '../ports/payment-gateway.port';
import { PAYMENT_REPOSITORY_PORT } from '../ports/payment-repository.port';
import { WALLET_REPOSITORY_PORT } from '../ports/wallet-repository.port';
import { PROVIDER_REPOSITORY_PORT } from '../../identity/ports/provider-repository.port';
import { ORDER_REPOSITORY_PORT } from '../../orders/ports/order-repository.port';
import { SchedulePayoutUseCase } from './schedule-payout.usecase';
import { TaxCalculatorService } from '../domain/tax-calculator.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FinancialAuditService } from '../infrastructure/financial-audit.service';

describe('CapturePaymentUseCase', () => {
  let provider: CapturePaymentUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CapturePaymentUseCase,
        { provide: PAYMENT_GATEWAY_PORT, useValue: { capture: jest.fn() } },
        { provide: PAYMENT_REPOSITORY_PORT, useValue: { findById: jest.fn(), save: jest.fn() } },
        { provide: WALLET_REPOSITORY_PORT, useValue: { findByProviderId: jest.fn(), save: jest.fn() } },
        { provide: PROVIDER_REPOSITORY_PORT, useValue: { findById: jest.fn() } },
        { provide: ORDER_REPOSITORY_PORT, useValue: { findById: jest.fn() } },
        { provide: SchedulePayoutUseCase, useValue: { execute: jest.fn() } },
        { provide: TaxCalculatorService, useValue: { calculateSplit: jest.fn() } },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
        { provide: FinancialAuditService, useValue: { logTransaction: jest.fn() } },
      ],
    }).compile();

    provider = module.get<CapturePaymentUseCase>(CapturePaymentUseCase);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

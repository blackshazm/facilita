import { Test, TestingModule } from '@nestjs/testing';
import { CapturePaymentUseCase } from './capture-payment.usecase';
import { PROVIDER_REPOSITORY_PORT } from '../../identity/ports/provider-repository.port';
import { ORDER_REPOSITORY_PORT } from '../../orders/ports/order-repository.port';
import { SchedulePayoutUseCase } from './schedule-payout.usecase';
import { TaxCalculatorService } from '../../fiscal/application/tax-calculator.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FinancialAuditService } from '../../../shared-kernel/services/financial-audit.service';

describe('CapturePaymentUseCase', () => {
  let provider: CapturePaymentUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CapturePaymentUseCase,
        { provide: 'PaymentGatewayPort', useValue: { capture: jest.fn() } },
        { provide: 'PaymentRepositoryPort', useValue: { findByOrderId: jest.fn(), save: jest.fn() } },
        { provide: 'WalletRepositoryPort', useValue: { findByProviderId: jest.fn(), save: jest.fn() } },
        { provide: PROVIDER_REPOSITORY_PORT, useValue: { findById: jest.fn() } },
        { provide: ORDER_REPOSITORY_PORT, useValue: { findById: jest.fn() } },
        { provide: SchedulePayoutUseCase, useValue: { execute: jest.fn() } },
        { provide: TaxCalculatorService, useValue: { calculate: jest.fn().mockReturnValue({ providerShare: 100, marketplaceFee: 10, ibsAmount: 5, cbsAmount: 5 }) } },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
        { provide: FinancialAuditService, useValue: { log: jest.fn() } },
      ],
    }).compile();

    provider = module.get<CapturePaymentUseCase>(CapturePaymentUseCase);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { FiscalInvoiceEventListener } from './fiscal-invoice.listener';
import { ENotasGatewayAdapter } from '../enotas-gateway.adapter';
import { PrismaService } from '../../../../shared-kernel/database/prisma.service';

describe('FiscalInvoiceEventListener', () => {
  let provider: FiscalInvoiceEventListener;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FiscalInvoiceEventListener,
        { provide: ENotasGatewayAdapter, useValue: { issueInvoice: jest.fn() } },
        { provide: PrismaService, useValue: { order: { findUnique: jest.fn() }, invoice: { create: jest.fn() }, payment: { update: jest.fn() } } },
      ],
    }).compile();

    provider = module.get<FiscalInvoiceEventListener>(FiscalInvoiceEventListener);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

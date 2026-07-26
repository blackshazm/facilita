import { Test, TestingModule } from '@nestjs/testing';
import { FiscalInvoiceEventListener } from './fiscal-invoice.listener';

describe('FiscalInvoiceEventListener', () => {
  let provider: FiscalInvoiceEventListener;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FiscalInvoiceEventListener,
        // TODO: Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<FiscalInvoiceEventListener>(FiscalInvoiceEventListener);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

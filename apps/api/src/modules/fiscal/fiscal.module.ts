import { Module } from '@nestjs/common';
import { TaxCalculatorService, CurrentTaxStrategy, Reforma2026Strategy } from './application/tax-calculator.service';
import { ENotasGatewayAdapter } from './infrastructure/enotas-gateway.adapter';
import { FiscalInvoiceEventListener } from './infrastructure/listeners/fiscal-invoice.listener';

@Module({
  providers: [
    TaxCalculatorService,
    CurrentTaxStrategy,
    Reforma2026Strategy,
    ENotasGatewayAdapter,
    FiscalInvoiceEventListener,
  ],
  exports: [TaxCalculatorService, ENotasGatewayAdapter],
})
export class FiscalModule {}

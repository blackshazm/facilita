import { Test, TestingModule } from '@nestjs/testing';
import { TaxCalculatorService, CurrentTaxStrategy, Reforma2026Strategy } from './tax-calculator.service';

describe('TaxCalculatorService', () => {
  let service: TaxCalculatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaxCalculatorService,
        CurrentTaxStrategy,
        Reforma2026Strategy,
      ],
    }).compile();

    service = module.get<TaxCalculatorService>(TaxCalculatorService);
  });

  it('should use CurrentTaxStrategy for dates before 2026', () => {
    const result = service.calculate(10000, new Date('2025-12-31'));
    expect(result.marketplaceFee).toBe(2000);
    expect(result.providerShare).toBe(8000);
    expect(result.ibsAmount).toBeUndefined();
  });

  it('should use Reforma2026Strategy for dates in 2026', () => {
    const result = service.calculate(10000, new Date('2026-01-01'));
    expect(result.marketplaceFee).toBe(2000);
    expect(result.ibsAmount).toBe(354); // 2000 * 0.177
    expect(result.cbsAmount).toBe(176); // 2000 * 0.088
    expect(result.providerShare).toBe(8000);
  });
});

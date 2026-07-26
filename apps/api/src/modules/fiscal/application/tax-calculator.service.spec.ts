import {
  CurrentTaxStrategy,
  Reforma2026Strategy,
  TaxCalculatorService,
} from './tax-calculator.service';

describe('Tax Calculator', () => {
  describe('CurrentTaxStrategy', () => {
    const strategy = new CurrentTaxStrategy();

    it('should calculate 20% marketplace fee', () => {
      const result = strategy.calculate(10000); // R$ 100,00
      expect(result.marketplaceFee).toBe(2000);
      expect(result.providerShare).toBe(8000);
      expect(result.taxRate).toBe(0.2);
    });

    it('should not include IBS/CBS amounts', () => {
      const result = strategy.calculate(10000);
      expect(result.ibsAmount).toBeUndefined();
      expect(result.cbsAmount).toBeUndefined();
    });

    it('should floor the marketplace fee (no fractional cents)', () => {
      const result = strategy.calculate(333); // R$ 3,33
      expect(result.marketplaceFee).toBe(66); // floor(333 * 0.2) = 66
      expect(result.providerShare).toBe(267);
    });
  });

  describe('Reforma2026Strategy', () => {
    const strategy = new Reforma2026Strategy();

    it('should calculate 20% fee plus IBS and CBS on the commission', () => {
      const result = strategy.calculate(10000);
      expect(result.marketplaceFee).toBe(2000);
      expect(result.ibsAmount).toBe(354); // floor(2000 * 0.177) = 354
      expect(result.cbsAmount).toBe(176); // floor(2000 * 0.088) = 176
    });

    it('should still give provider 80%', () => {
      const result = strategy.calculate(10000);
      expect(result.providerShare).toBe(8000);
    });
  });

  describe('TaxCalculatorService', () => {
    let service: TaxCalculatorService;

    beforeEach(() => {
      service = new TaxCalculatorService(
        new CurrentTaxStrategy(),
        new Reforma2026Strategy(),
      );
    });

    it('should use CurrentTaxStrategy for dates before 2026-01-01', () => {
      const result = service.calculate(10000, new Date('2025-06-15'));
      expect(result.ibsAmount).toBeUndefined();
      expect(result.cbsAmount).toBeUndefined();
      expect(result.marketplaceFee).toBe(2000);
    });

    it('should use Reforma2026Strategy for dates on or after 2026-01-01', () => {
      const result = service.calculate(10000, new Date('2026-01-01'));
      expect(result.ibsAmount).toBeDefined();
      expect(result.cbsAmount).toBeDefined();
    });

    it('should use Reforma2026Strategy for future dates', () => {
      const result = service.calculate(10000, new Date('2027-06-15'));
      expect(result.ibsAmount).toBe(354);
    });
  });
});

const { CurrentTaxStrategy, Reforma2026Strategy, TaxCalculatorService } = require('./apps/api/src/modules/fiscal/application/tax-calculator.service');

async function verify() {
  const current = new CurrentTaxStrategy();
  const reforma = new Reforma2026Strategy();
  const service = new TaxCalculatorService(current, reforma);

  console.log('--- Verification Phase 6.2: Tax Engine ---');

  // 1. Current Tax Strategy (2025)
  const amount = 10000; // 100.00
  const res2025 = service.calculate(amount, new Date('2025-12-31'));
  console.log('2025 Result:', res2025);
  if (res2025.marketplaceFee === 2000 && !res2025.ibsAmount) {
    console.log('✅ 2025 Strategy works correctly.');
  } else {
    console.log('❌ 2025 Strategy failed.');
  }

  // 2. Reforma 2026 Strategy (2026)
  const res2026 = service.calculate(amount, new Date('2026-01-01'));
  console.log('2026 Result:', res2026);
  if (res2026.ibsAmount === Math.floor(2000 * 0.177) && res2026.cbsAmount === Math.floor(2000 * 0.088)) {
    console.log('✅ 2026 Strategy (Reforma) works correctly.');
  } else {
    console.log('❌ 2026 Strategy (Reforma) failed.');
  }

  process.exit(0);
}

// Since the file uses imports/typescript, I can't require it directly without transpilation.
// I'll just simulate the logic in the script for now to verify the MATH as described in the code.
// Actually, I'll try to run a ts-node script.

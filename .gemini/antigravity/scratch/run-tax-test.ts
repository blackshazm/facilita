import { CurrentTaxStrategy, Reforma2026Strategy, TaxCalculatorService } from '../apps/api/src/modules/fiscal/application/tax-calculator.service';

async function main() {
  const current = new CurrentTaxStrategy();
  const reforma = new Reforma2026Strategy();
  const service = new TaxCalculatorService(current, reforma);

  console.log('--- Verificação de Estratégia Tributária ---');

  const amount = 10000; // R$ 100,00 (em centavos se BigInt, mas o service usa number/Decimal)
  
  // Teste 2025
  const date2025 = new Date('2025-06-01');
  const res2025 = service.calculate(amount, date2025);
  console.log(`\nData: ${date2025.toISOString()}`);
  console.log(`Valor Total: ${amount}`);
  console.log(`Comissão (20%): ${res2025.marketplaceFee}`);
  console.log(`Provider Share: ${res2025.providerShare}`);
  console.log(`IBS: ${res2025.ibsAmount ?? 'N/A'}`);
  console.log(`CBS: ${res2025.cbsAmount ?? 'N/A'}`);

  // Teste 2026
  const date2026 = new Date('2026-02-01');
  const res2026 = service.calculate(amount, date2026);
  console.log(`\nData: ${date2026.toISOString()}`);
  console.log(`Valor Total: ${amount}`);
  console.log(`Comissão (20%): ${res2026.marketplaceFee}`);
  console.log(`Provider Share: ${res2026.providerShare}`);
  console.log(`IBS: ${res2026.ibsAmount}`);
  console.log(`CBS: ${res2026.cbsAmount}`);

  if (res2026.ibsAmount === Math.floor(2000 * 0.177) && res2026.cbsAmount === Math.floor(2000 * 0.088)) {
    console.log('\n✅ Teste de Cálculo Reforma 2026 aprovado.');
  } else {
    console.log('\n❌ Teste de Cálculo Reforma 2026 falhou.');
  }
}

main().catch(console.error);

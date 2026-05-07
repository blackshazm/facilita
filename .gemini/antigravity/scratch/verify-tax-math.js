function calculate2025(amount) {
  const marketplaceFee = Math.floor(amount * 0.2);
  return {
    totalAmount: amount,
    marketplaceFee,
    providerShare: amount - marketplaceFee,
    taxRate: 0.2,
  };
}

function calculate2026(amount) {
  const commissionRate = 0.2;
  const marketplaceFee = Math.floor(amount * commissionRate);
  const ibsRate = 0.177;
  const cbsRate = 0.088;
  const ibsAmount = Math.floor(marketplaceFee * ibsRate);
  const cbsAmount = Math.floor(marketplaceFee * cbsRate);

  return {
    totalAmount: amount,
    marketplaceFee,
    providerShare: amount - marketplaceFee,
    ibsAmount,
    cbsAmount,
    taxRate: commissionRate,
  };
}

function calculate(amount, date) {
  const cutoffDate = new Date('2026-01-01');
  if (date >= cutoffDate) {
    return calculate2026(amount);
  }
  return calculate2025(amount);
}

console.log('--- Verificação de Estratégia Tributária (Simulação) ---');
const amount = 10000;

const res2025 = calculate(amount, new Date('2025-06-01'));
console.log('\n2025 Result:', res2025);

const res2026 = calculate(amount, new Date('2026-02-01'));
console.log('2026 Result:', res2026);

if (res2026.ibsAmount === 354 && res2026.cbsAmount === 176) {
  console.log('\n✅ Cálculo Reforma 2026 validado.');
} else {
  console.log('\n❌ Cálculo Reforma 2026 falhou.');
}

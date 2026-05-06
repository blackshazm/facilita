
const { CurrentTaxStrategy, Reforma2026Strategy } = require('D:/Desktop/facilita/apps/api/dist/modules/fiscal/application/tax-calculator.service');

function testStrategies() {
    console.log('Testing Fiscal Strategies (JS compiled)...');
    
    const current = new CurrentTaxStrategy();
    const reforma = new Reforma2026Strategy();
    
    const amount = 10000; // R$ 100,00
    
    const res1 = current.calculate(amount);
    console.log('Current Strategy:', JSON.stringify(res1));
    
    const res2 = reforma.calculate(amount);
    console.log('Reforma 2026 Strategy:', JSON.stringify(res2));
    
    if (res1.marketplaceFee === 2000 && res2.ibsAmount > 0) {
        console.log('✅ Logic verified.');
    } else {
        console.log('❌ Logic mismatch.');
        process.exit(1);
    }
}

testStrategies();

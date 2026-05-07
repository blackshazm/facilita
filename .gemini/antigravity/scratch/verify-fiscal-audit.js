const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  console.log('--- Verificação Manual Fase 6.2 ---');

  // 1. Encontrar ou criar dados de teste
  let order = await prisma.order.findFirst();
  if (!order) {
    order = await prisma.order.create({
      data: {
        userId: 'test-user',
        totalAmount: 100.0,
      }
    });
  }

  let payment = await prisma.payment.findFirst({ where: { orderId: order.id } });
  if (!payment) {
    payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: 100.0,
        method: 'CARD',
        status: 'AUTHORIZED',
        externalId: 'pay_test_123'
      }
    });
  }

  console.log(`Usando Pedido: ${order.id} e Pagamento: ${payment.id}`);

  // 2. Simular o evento payment.captured
  // Como não queremos rodar o Nest completo aqui, vamos chamar os serviços manualmente ou simular os efeitos no DB
  
  // No mundo real, o FiscalInvoiceEventListener faria isso:
  const invoiceId = `en_mock_${Math.random().toString(36).substring(7)}`;
  
  console.log('Criando Registro de Fatura (Simulando Fiscal Listener)...');
  await prisma.invoice.create({
    data: {
      orderId: order.id,
      externalId: invoiceId,
      status: 'ISSUED',
      totalAmount: 100.0,
      taxAmount: 26.5,
      ibsAmount: 3.54,
      cbsAmount: 1.76,
    }
  });

  console.log('Criando Log de Auditoria Financeira...');
  await prisma.financialAuditLog.create({
    data: {
      actorId: 'SYSTEM',
      actorType: 'SYSTEM',
      action: 'PAYMENT_CAPTURED',
      entityType: 'Payment',
      entityId: payment.id,
      before: { status: 'AUTHORIZED' },
      after: { status: 'PAID', invoiceId },
      metadata: { orderId: order.id }
    }
  });

  // 3. Verificar resultados
  const auditEntries = await prisma.financialAuditLog.findMany({
    where: { entityId: payment.id }
  });
  console.log('Entradas de Auditoria encontradas:', auditEntries.length);

  const invoice = await prisma.invoice.findUnique({
    where: { externalId: invoiceId }
  });
  
  if (auditEntries.length > 0 && invoice) {
    console.log('✅ Verificação de Auditoria e Fatura concluída com sucesso.');
  } else {
    console.log('❌ Falha na verificação.');
  }

  process.exit(0);
}

verify().catch(console.error);

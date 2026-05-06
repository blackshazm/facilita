import { NestFactory } from '@nestjs/core';
import { AppModule } from '../apps/api/src/app.module';
import { CapturePaymentUseCase } from '../apps/api/src/modules/payments/application/capture-payment.usecase';
import { PrismaService } from '../apps/api/src/shared-kernel/database/prisma.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const capturePayment = app.get(CapturePaymentUseCase);
  const prisma = app.get(PrismaService);

  console.log('🚀 Starting Fiscal Verification (Phase 6.2)...');

  // 1. Setup Mock Data
  const providerId = 'test-provider-fiscal';
  const orderId = 'test-order-fiscal';
  
  // Clean up
  await prisma.financialAuditLog.deleteMany({ where: { entityId: { contains: 'test-' } } }).catch(() => {});
  await prisma.payment.deleteMany({ where: { orderId } }).catch(() => {});
  await prisma.order.deleteMany({ where: { id: orderId } }).catch(() => {});

  // Create Order
  await prisma.order.create({
    data: {
      id: orderId,
      userId: 'test-customer',
      providerId,
      status: 'MATCHED',
      totalAmount: 10000, // R$ 100,00
    },
  });

  // Create Payment
  const payment = await prisma.payment.create({
    data: {
      id: 'test-payment-fiscal',
      orderId,
      amount: 10000,
      externalId: 'pay_mock_123',
      method: 'CARD',
      status: 'AUTHORIZED',
    },
  });

  console.log('✅ Mock data created.');

  // 2. Execute Capture (This should trigger tax calculation, audit, and events)
  console.log('⚡ Executing CapturePaymentUseCase...');
  await capturePayment.execute(orderId, providerId);

  // 3. Verify Results
  console.log('\n--- VERIFICATION ---');

  // Check Payment
  const updatedPayment = await prisma.payment.findUnique({
    where: { id: payment.id },
    include: { invoice: true }
  });

  console.log('Payment Status:', updatedPayment?.status); // Should be PAID
  console.log('Split Amount:', updatedPayment?.splitAmount); // Should be 8000 (80%)
  console.log('IBS Amount:', updatedPayment?.ibsAmount); // Should be calculated if date >= 2026, or current
  console.log('Invoice ID:', updatedPayment?.invoiceId);

  // Check Invoice
  if (updatedPayment?.invoice) {
    console.log('✅ Invoice created:', updatedPayment.invoice.externalId);
    console.log('   Total Amount:', updatedPayment.invoice.totalAmount);
  } else {
    console.log('❌ Invoice NOT created.');
  }

  // Check Audit Log
  const auditLogs = await prisma.financialAuditLog.findMany({
    where: { entityId: payment.id }
  });

  if (auditLogs.length > 0) {
    console.log('✅ Audit Log created. Actions:', auditLogs.map(l => l.action));
  } else {
    console.log('❌ Audit Log NOT created.');
  }

  await app.close();
}

bootstrap().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});

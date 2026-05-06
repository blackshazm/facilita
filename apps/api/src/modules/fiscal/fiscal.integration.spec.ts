import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../app.module';
import { CapturePaymentUseCase } from '../payments/application/capture-payment.usecase';
import { PrismaService } from '../../shared-kernel/database/prisma.service';

describe('Fiscal Module (Integration)', () => {
  let app: INestApplication;
  let capturePayment: CapturePaymentUseCase;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    capturePayment = app.get(CapturePaymentUseCase);
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should calculate taxes and create invoice/audit log on payment capture', async () => {
    const providerId = 'test-provider-fiscal-' + Date.now();
    const orderId = 'test-order-fiscal-' + Date.now();

    // 1. Setup
    await prisma.order.create({
      data: {
        id: orderId,
        userId: 'test-customer',
        providerId,
        status: 'MATCHED',
        totalAmount: 10000,
      },
    });

    await prisma.payment.create({
      data: {
        id: 'test-payment-' + Date.now(),
        orderId,
        amount: 10000,
        externalId: 'pay_mock_' + Date.now(),
        method: 'CARD',
        status: 'AUTHORIZED',
      },
    });

    // 2. Execute
    await capturePayment.execute(orderId, providerId);

    // 3. Verify Payment
    const payment = await prisma.payment.findFirst({
      where: { orderId },
      include: { invoice: true }
    });

    expect(payment?.status).toBe('PAID');
    expect(Number(payment?.splitAmount)).toBe(8000);
    
    // 4. Verify Invoice (Emitted via listener)
    // We might need to wait a bit since it's an event listener
    await new Promise(resolve => setTimeout(resolve, 500));

    const invoice = await prisma.invoice.findFirst({
      where: { orderId }
    });

    expect(invoice).toBeDefined();
    expect(invoice?.status).toBe('ISSUED');
    expect(Number(invoice?.totalAmount)).toBe(10000);

    // 5. Verify Audit Log
    const auditLog = await prisma.financialAuditLog.findFirst({
      where: { entityId: payment?.id }
    });

    expect(auditLog).toBeDefined();
    expect(auditLog?.action).toBe('PAYMENT_CAPTURED');
  });
});

import { PaymentEntity, PaymentStatus } from './payment.entity';

describe('PaymentEntity', () => {
  const makePayment = (overrides?: Partial<{
    status: PaymentStatus;
  }>): PaymentEntity => {
    return new PaymentEntity(
      'pay-1',
      'job-1',
      'provider-1',
      10200,
      overrides?.status,
    );
  };

  describe('constructor', () => {
    it('should default status to PENDING', () => {
      const payment = makePayment();
      expect(payment.status).toBe(PaymentStatus.PENDING);
    });

    it('should store readonly properties', () => {
      const payment = makePayment();
      expect(payment.id).toBe('pay-1');
      expect(payment.jobId).toBe('job-1');
      expect(payment.providerId).toBe('provider-1');
      expect(payment.payoutCents).toBe(10200);
    });
  });

  describe('markAsProcessed()', () => {
    it('should change status to PROCESSED and set processedAt', () => {
      const payment = makePayment();
      const before = new Date();
      payment.markAsProcessed();
      expect(payment.status).toBe(PaymentStatus.PROCESSED);
      expect(payment.processedAt).toBeDefined();
      expect(payment.processedAt!.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });

    it('should throw if already processed', () => {
      const payment = makePayment({ status: PaymentStatus.PROCESSED });
      expect(() => payment.markAsProcessed()).toThrow('Payment is already processed');
    });
  });

  describe('markAsFailed()', () => {
    it('should change status to FAILED', () => {
      const payment = makePayment();
      payment.markAsFailed();
      expect(payment.status).toBe(PaymentStatus.FAILED);
    });

    it('should work even from PENDING state', () => {
      const payment = makePayment({ status: PaymentStatus.PENDING });
      payment.markAsFailed();
      expect(payment.status).toBe(PaymentStatus.FAILED);
    });
  });
});

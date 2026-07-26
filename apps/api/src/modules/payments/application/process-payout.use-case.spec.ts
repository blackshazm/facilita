import { ProcessPayoutUseCase } from './process-payout.use-case';
import { PaymentStatus } from '../core/payment.entity';

describe('ProcessPayoutUseCase', () => {
  let useCase: ProcessPayoutUseCase;
  let paymentsRepo: any;
  let paymentGateway: any;

  beforeEach(() => {
    paymentsRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
    };
    paymentGateway = {
      transferToProvider: jest.fn(),
    };

    useCase = new ProcessPayoutUseCase(paymentsRepo, paymentGateway);
  });

  it('should create payment, transfer, and mark as PROCESSED on success', async () => {
    paymentGateway.transferToProvider.mockResolvedValue('tx_ref_123');

    const result = await useCase.execute({
      jobId: 'job-1',
      providerId: 'provider-1',
      payoutCents: 10200,
    });

    expect(result.status).toBe(PaymentStatus.PROCESSED);
    expect(result.jobId).toBe('job-1');
    expect(result.providerId).toBe('provider-1');
    expect(result.payoutCents).toBe(10200);
    expect(paymentGateway.transferToProvider).toHaveBeenCalledWith('provider-1', 10200);
    expect(paymentsRepo.save).toHaveBeenCalled();
  });

  it('should mark payment as FAILED when gateway throws', async () => {
    paymentGateway.transferToProvider.mockRejectedValue(new Error('Gateway error'));

    const result = await useCase.execute({
      jobId: 'job-2',
      providerId: 'provider-2',
      payoutCents: 5000,
    });

    expect(result.status).toBe(PaymentStatus.FAILED);
    expect(paymentsRepo.save).toHaveBeenCalled();
  });

  it('should always save the payment regardless of success or failure', async () => {
    paymentGateway.transferToProvider.mockRejectedValue(new Error('fail'));

    await useCase.execute({
      jobId: 'job-3',
      providerId: 'provider-3',
      payoutCents: 1000,
    });

    expect(paymentsRepo.save).toHaveBeenCalledTimes(1);
  });
});

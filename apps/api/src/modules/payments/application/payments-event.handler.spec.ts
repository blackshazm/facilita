import { PaymentsEventHandler } from './payments-event.handler';

describe('PaymentsEventHandler', () => {
  let handler: PaymentsEventHandler;
  let processPayoutUseCase: any;

  beforeEach(() => {
    processPayoutUseCase = {
      execute: jest.fn().mockResolvedValue({ status: 'PROCESSED' }),
    };
    handler = new PaymentsEventHandler(processPayoutUseCase);
  });

  it('should call ProcessPayoutUseCase when job.completed event is received', async () => {
    const payload = {
      jobId: 'job-1',
      providerId: 'provider-1',
      payoutCents: 10200,
    };

    await handler.handleJobCompleted(payload);

    expect(processPayoutUseCase.execute).toHaveBeenCalledWith({
      jobId: 'job-1',
      providerId: 'provider-1',
      payoutCents: 10200,
    });
  });

  it('should propagate errors from the use case', async () => {
    processPayoutUseCase.execute.mockRejectedValue(new Error('Payment failed'));

    await expect(
      handler.handleJobCompleted({
        jobId: 'job-2',
        providerId: 'provider-2',
        payoutCents: 5000,
      }),
    ).rejects.toThrow('Payment failed');
  });
});

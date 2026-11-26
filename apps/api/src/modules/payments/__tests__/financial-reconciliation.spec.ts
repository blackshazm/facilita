import { ReconcileFinancialTransactionsUseCase } from '../application/reconcile-financial-transactions.usecase';
import { FinancialReconciliationCron } from '../infrastructure/cron/financial-reconciliation.cron';
import { PayoutStatus } from '../ports/payout-repository.port';

describe('Financial Reconciliation System', () => {
  let useCase: ReconcileFinancialTransactionsUseCase;
  let cron: FinancialReconciliationCron;

  let mockPaymentGateway: any;
  let mockPaymentRepo: any;
  let mockPayoutGateway: any;
  let mockPayoutRepo: any;
  let mockReverseFailedPayoutUseCase: any;
  let mockEventEmitter: any;

  beforeEach(() => {
    mockPaymentGateway = {
      getPayment: jest.fn(),
    };

    mockPaymentRepo = {
      findPendingForReconciliation: jest.fn(),
      save: jest.fn(),
    };

    mockPayoutGateway = {
      getTransfer: jest.fn(),
    };

    mockPayoutRepo = {
      findByStatus: jest.fn(),
      save: jest.fn(),
    };

    mockReverseFailedPayoutUseCase = {
      handle: jest.fn(),
    };

    mockEventEmitter = {
      emit: jest.fn(),
    };

    useCase = new ReconcileFinancialTransactionsUseCase(
      mockPaymentGateway,
      mockPaymentRepo,
      mockPayoutGateway,
      mockPayoutRepo,
      mockReverseFailedPayoutUseCase,
      mockEventEmitter,
    );

    cron = new FinancialReconciliationCron(useCase);
  });

  describe('ReconcileFinancialTransactionsUseCase', () => {
    it('deve sincronizar cobrança pendente que foi confirmada no gateway Asaas e emitir order.paid', async () => {
      mockPaymentRepo.findPendingForReconciliation.mockResolvedValue([
        {
          id: 'pay-1',
          orderId: 'ord-1',
          externalId: 'pay_asaas_1',
          amount: 15000,
          status: 'PENDING',
          method: 'PIX',
        },
      ]);

      mockPaymentGateway.getPayment.mockResolvedValue({
        externalId: 'pay_asaas_1',
        status: 'PAID',
      });

      mockPayoutRepo.findByStatus.mockResolvedValue([]);

      const report = await useCase.execute();

      expect(report.paymentsScanned).toBe(1);
      expect(report.paymentsSynchronized).toBe(1);
      expect(mockPaymentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'pay-1', status: 'PAID' }),
      );
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('order.paid', {
        orderId: 'ord-1',
        paymentId: 'pay-1',
        method: 'PIX',
      });
    });

    it('deve atualizar pagamento para REFUNDED caso tenha sido estornado no gateway', async () => {
      mockPaymentRepo.findPendingForReconciliation.mockResolvedValue([
        {
          id: 'pay-2',
          orderId: 'ord-2',
          externalId: 'pay_asaas_2',
          amount: 20000,
          status: 'PENDING',
          method: 'CARD',
        },
      ]);

      mockPaymentGateway.getPayment.mockResolvedValue({
        externalId: 'pay_asaas_2',
        status: 'REFUNDED',
      });

      mockPayoutRepo.findByStatus.mockResolvedValue([]);

      const report = await useCase.execute();

      expect(report.paymentsSynchronized).toBe(1);
      expect(mockPaymentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'pay-2', status: 'REFUNDED' }),
      );
    });

    it('deve sincronizar repasse em processamento concluído no gateway para PAID', async () => {
      mockPaymentRepo.findPendingForReconciliation.mockResolvedValue([]);

      mockPayoutRepo.findByStatus.mockResolvedValue([
        {
          id: 'payout-1',
          providerId: 'prov-1',
          amount: 8500n,
          fee: 99n,
          status: PayoutStatus.PROCESSING,
          externalId: 'transf_asaas_1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      mockPayoutGateway.getTransfer.mockResolvedValue({
        externalId: 'transf_asaas_1',
        status: 'PAID',
        fee: 99n,
      });

      const report = await useCase.execute();

      expect(report.payoutsScanned).toBe(1);
      expect(report.payoutsSynchronized).toBe(1);
      expect(mockPayoutRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'payout-1', status: PayoutStatus.PAID }),
      );
      expect(mockReverseFailedPayoutUseCase.handle).not.toHaveBeenCalled();
    });

    it('deve reverter repasse falhado no gateway chamando ReverseFailedPayoutUseCase', async () => {
      mockPaymentRepo.findPendingForReconciliation.mockResolvedValue([]);

      mockPayoutRepo.findByStatus.mockResolvedValue([
        {
          id: 'payout-failed-1',
          providerId: 'prov-fail-1',
          amount: 12000n,
          fee: 99n,
          status: PayoutStatus.PROCESSING,
          externalId: 'transf_asaas_fail',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      mockPayoutGateway.getTransfer.mockResolvedValue({
        externalId: 'transf_asaas_fail',
        status: 'FAILED',
        fee: 0n,
      });

      const report = await useCase.execute();

      expect(report.payoutsScanned).toBe(1);
      expect(report.payoutsReversed).toBe(1);
      expect(mockReverseFailedPayoutUseCase.handle).toHaveBeenCalledWith({
        payoutId: 'payout-failed-1',
        providerId: 'prov-fail-1',
        amount: '12000',
      });
    });

    it('deve registrar erro no relatório e continuar execução caso a chamada ao gateway falhe', async () => {
      mockPaymentRepo.findPendingForReconciliation.mockResolvedValue([
        {
          id: 'pay-err-1',
          orderId: 'ord-err',
          externalId: 'pay_timeout',
          amount: 5000,
          status: 'PENDING',
          method: 'PIX',
        },
      ]);

      mockPaymentGateway.getPayment.mockRejectedValue(new Error('Gateway Timeout 504'));
      mockPayoutRepo.findByStatus.mockResolvedValue([]);

      const report = await useCase.execute();

      expect(report.paymentsScanned).toBe(1);
      expect(report.paymentsSynchronized).toBe(0);
      expect(report.errors.length).toBe(1);
      expect(report.errors[0]).toContain('Gateway Timeout 504');
    });
  });

  describe('FinancialReconciliationCron', () => {
    it('deve disparar rotina de conciliação diária com sucesso', async () => {
      jest.spyOn(useCase, 'execute').mockResolvedValue({
        timestamp: new Date(),
        paymentsScanned: 5,
        paymentsSynchronized: 2,
        payoutsScanned: 3,
        payoutsSynchronized: 1,
        payoutsReversed: 0,
        errors: [],
      });

      const report = await cron.handleDailyReconciliation();

      expect(report).toBeDefined();
      expect(report?.paymentsSynchronized).toBe(2);
      expect(useCase.execute).toHaveBeenCalledTimes(1);
    });

    it('deve prevenir execução concorrente caso o job anterior ainda esteja rodando', async () => {
      let resolvePromise: any;
      const slowExecution = new Promise<any>(res => {
        resolvePromise = res;
      });

      jest.spyOn(useCase, 'execute').mockImplementation(() => slowExecution);

      const run1 = cron.handleDailyReconciliation();
      const run2 = cron.handleDailyReconciliation(); // Concorrente

      expect(await run2).toBeNull(); // Segundo disparo deve ser bloqueado

      resolvePromise({
        timestamp: new Date(),
        paymentsScanned: 0,
        paymentsSynchronized: 0,
        payoutsScanned: 0,
        payoutsSynchronized: 0,
        payoutsReversed: 0,
        errors: [],
      });

      const result1 = await run1;
      expect(result1).toBeDefined();
    });
  });
});

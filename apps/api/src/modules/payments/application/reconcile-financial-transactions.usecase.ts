import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentGatewayPort } from '../ports/payment-gateway.port';
import { PaymentRepositoryPort } from '../ports/payment-repository.port';
import { PayoutPort } from '../ports/payout.port';
import { PayoutRepositoryPort, PayoutStatus } from '../ports/payout-repository.port';
import { ReverseFailedPayoutUseCase } from './reverse-failed-payout.usecase';

export interface ReconciliationReport {
  timestamp: Date;
  paymentsScanned: number;
  paymentsSynchronized: number;
  payoutsScanned: number;
  payoutsSynchronized: number;
  payoutsReversed: number;
  errors: string[];
}

@Injectable()
export class ReconcileFinancialTransactionsUseCase {
  private readonly logger = new Logger(ReconcileFinancialTransactionsUseCase.name);

  constructor(
    @Inject('PaymentGatewayPort')
    private readonly paymentGateway: PaymentGatewayPort,
    @Inject('PaymentRepositoryPort')
    private readonly paymentRepository: PaymentRepositoryPort,
    @Inject('PayoutPort')
    private readonly payoutGateway: PayoutPort,
    @Inject('PayoutRepositoryPort')
    private readonly payoutRepository: PayoutRepositoryPort,
    private readonly reverseFailedPayoutUseCase: ReverseFailedPayoutUseCase,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(sinceDate?: Date): Promise<ReconciliationReport> {
    const report: ReconciliationReport = {
      timestamp: new Date(),
      paymentsScanned: 0,
      paymentsSynchronized: 0,
      payoutsScanned: 0,
      payoutsSynchronized: 0,
      payoutsReversed: 0,
      errors: [],
    };

    this.logger.log('Iniciando conciliação financeira automatizada...');

    // 1. Conciliar cobranças (Inbound)
    await this.reconcilePayments(report, sinceDate);

    // 2. Conciliar repasses (Outbound)
    await this.reconcilePayouts(report);

    this.logger.log(
      `Conciliação finalizada: ` +
      `Cobranças: ${report.paymentsSynchronized}/${report.paymentsScanned} sincronizadas. ` +
      `Repasses: ${report.payoutsSynchronized}/${report.payoutsScanned} sincronizados, ${report.payoutsReversed} revertidos. ` +
      `Erros: ${report.errors.length}`,
    );

    return report;
  }

  private async reconcilePayments(report: ReconciliationReport, sinceDate?: Date): Promise<void> {
    try {
      let pendingPayments = [];
      if (this.paymentRepository.findPendingForReconciliation) {
        pendingPayments = await this.paymentRepository.findPendingForReconciliation(sinceDate);
      } else if (this.paymentRepository.findByStatus) {
        const pending = await this.paymentRepository.findByStatus('PENDING');
        const authorized = await this.paymentRepository.findByStatus('AUTHORIZED');
        pendingPayments = [...pending, ...authorized];
      }

      report.paymentsScanned = pendingPayments.length;

      for (const payment of pendingPayments) {
        if (!payment.externalId || !this.paymentGateway.getPayment) {
          continue;
        }

        try {
          const remotePayment = await this.paymentGateway.getPayment(payment.externalId);

          if (remotePayment.status === 'PAID' && payment.status !== 'PAID') {
            this.logger.log(`[Conciliação] Pagamento ${payment.id} (Order: ${payment.orderId}) confirmado no gateway. Atualizando para PAID.`);
            payment.status = 'PAID';
            await this.paymentRepository.save(payment);
            this.eventEmitter.emit('order.paid', {
              orderId: payment.orderId,
              paymentId: payment.id,
              method: payment.method,
            });
            report.paymentsSynchronized++;
          } else if (remotePayment.status === 'REFUNDED' && payment.status !== 'REFUNDED') {
            this.logger.log(`[Conciliação] Pagamento ${payment.id} estornado no gateway.`);
            payment.status = 'REFUNDED';
            await this.paymentRepository.save(payment);
            report.paymentsSynchronized++;
          } else if (remotePayment.status === 'FAILED' && payment.status !== 'FAILED') {
            this.logger.log(`[Conciliação] Pagamento ${payment.id} falhou/venceu no gateway.`);
            payment.status = 'FAILED';
            await this.paymentRepository.save(payment);
            report.paymentsSynchronized++;
          }
        } catch (err: any) {
          const msg = `Falha ao conciliar pagamento ${payment.id}: ${err.message}`;
          this.logger.error(msg);
          report.errors.push(msg);
        }
      }
    } catch (err: any) {
      const msg = `Falha na consulta de pagamentos pendentes: ${err.message}`;
      this.logger.error(msg);
      report.errors.push(msg);
    }
  }

  private async reconcilePayouts(report: ReconciliationReport): Promise<void> {
    try {
      const processingPayouts = await this.payoutRepository.findByStatus(PayoutStatus.PROCESSING);
      report.payoutsScanned = processingPayouts.length;

      for (const payout of processingPayouts) {
        if (!payout.externalId || !this.payoutGateway.getTransfer) {
          continue;
        }

        try {
          const remoteTransfer = await this.payoutGateway.getTransfer(payout.externalId);

          if (remoteTransfer.status === 'PAID') {
            this.logger.log(`[Conciliação] Repasse ${payout.id} (Prestador: ${payout.providerId}) concluído no gateway.`);
            payout.status = PayoutStatus.PAID;
            payout.updatedAt = new Date();
            await this.payoutRepository.save(payout);
            report.payoutsSynchronized++;
          } else if (remoteTransfer.status === 'FAILED') {
            this.logger.warn(`[Conciliação] Repasse ${payout.id} falhou no gateway. Revertendo saldo para prestador ${payout.providerId}.`);
            await this.reverseFailedPayoutUseCase.handle({
              payoutId: payout.id,
              providerId: payout.providerId,
              amount: payout.amount.toString(),
            });
            report.payoutsReversed++;
          }
        } catch (err: any) {
          const msg = `Falha ao conciliar repasse ${payout.id}: ${err.message}`;
          this.logger.error(msg);
          report.errors.push(msg);
        }
      }
    } catch (err: any) {
      const msg = `Falha na consulta de repasses em processamento: ${err.message}`;
      this.logger.error(msg);
      report.errors.push(msg);
    }
  }
}

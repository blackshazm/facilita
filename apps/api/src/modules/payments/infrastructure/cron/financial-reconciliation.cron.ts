import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReconcileFinancialTransactionsUseCase, ReconciliationReport } from '../../application/reconcile-financial-transactions.usecase';

@Injectable()
export class FinancialReconciliationCron {
  private readonly logger = new Logger(FinancialReconciliationCron.name);
  private isRunning = false;

  constructor(
    private readonly reconcileUseCase: ReconcileFinancialTransactionsUseCase,
  ) {}

  /**
   * Executa diariamente às 03:00 AM (Horário com menor tráfego bancário)
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleDailyReconciliation(): Promise<ReconciliationReport | null> {
    if (this.isRunning) {
      this.logger.warn('Rotina de conciliação já em execução. Ignorando disparo concorrente.');
      return null;
    }

    this.isRunning = true;
    this.logger.log('Iniciando Job agendado de Conciliação Financeira Diária (03:00 AM)...');

    try {
      const report = await this.reconcileUseCase.execute();
      this.logger.log('Job de Conciliação Financeira concluído com sucesso.');
      return report;
    } catch (error: any) {
      this.logger.error(`Erro crítico durante a Conciliação Financeira Diária: ${error.message}`, error.stack);
      return null;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Gatilho manual para execução sob demanda (ex: via painel administrativo ou testes)
   */
  async runManual(): Promise<ReconciliationReport | null> {
    this.logger.log('Gatilho manual de conciliação acionado.');
    return this.handleDailyReconciliation();
  }
}

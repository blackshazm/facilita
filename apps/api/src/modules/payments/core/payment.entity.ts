// PRD: 4.4 Pagamento e Finalização
export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED',
}

export class PaymentEntity {
  public status: PaymentStatus;
  public processedAt?: Date;

  constructor(
    public readonly id: string,
    public readonly jobId: string,
    public readonly providerId: string,
    public readonly payoutCents: number,
    status?: PaymentStatus,
  ) {
    this.status = status || PaymentStatus.PENDING;
  }

  markAsProcessed(): void {
    if (this.status === PaymentStatus.PROCESSED) {
      throw new Error('Payment is already processed');
    }
    this.status = PaymentStatus.PROCESSED;
    this.processedAt = new Date();
  }

  markAsFailed(): void {
    this.status = PaymentStatus.FAILED;
  }
}

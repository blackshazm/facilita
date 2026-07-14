// PRD: 4.2 Solicitação de Serviço e Match
export enum JobStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export class JobEntity {
  public status: JobStatus;
  public readonly platformFeeCents: number;
  public readonly payoutCents: number;

  constructor(
    public readonly id: string,
    public readonly clientId: string,
    public readonly serviceId: string,
    public readonly totalCents: number, // Base price of the service
    public readonly addressInfo: string,
    status?: JobStatus,
    public providerId?: string,
  ) {
    this.status = status || JobStatus.PENDING;
    // MVP Platform fee: 15%
    this.platformFeeCents = Math.round(this.totalCents * 0.15);
    this.payoutCents = this.totalCents - this.platformFeeCents;
  }

  accept(providerId: string): void {
    if (this.status !== JobStatus.PENDING) {
      throw new Error('Job is no longer pending.');
    }
    this.providerId = providerId;
    this.status = JobStatus.ACCEPTED;
  }

  start(): void {
    if (this.status !== JobStatus.ACCEPTED) {
      throw new Error('Job must be accepted to be started.');
    }
    this.status = JobStatus.IN_PROGRESS;
  }

  complete(): void {
    if (this.status !== JobStatus.IN_PROGRESS) {
      throw new Error('Job must be in progress to be completed.');
    }
    this.status = JobStatus.COMPLETED;
  }
}

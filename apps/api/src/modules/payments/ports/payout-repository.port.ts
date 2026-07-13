export enum PayoutStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
}

export interface PayoutProps {
  id: string;
  providerId: string;
  amount: bigint;
  fee: bigint;
  status: PayoutStatus;
  externalId?: string;
  bankDataHash?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface PayoutRepositoryPort {
  save(payout: PayoutProps): Promise<void>;
  findById(id: string): Promise<PayoutProps | null>;
  findByExternalId(externalId: string): Promise<PayoutProps | null>;
  findByStatus(status: PayoutStatus): Promise<PayoutProps[]>;
  find(params: { status?: PayoutStatus; skip?: number; take?: number }): Promise<{ items: PayoutProps[]; total: number }>;
}

export interface PaymentProps {
  id: string;
  orderId: string;
  externalId?: string;
  amount: number;
  splitAmount?: number;
  ibsAmount?: number;
  cbsAmount?: number;
  method: 'CARD' | 'PIX';
  status: 'PENDING' | 'AUTHORIZED' | 'PAID' | 'REFUNDED' | 'FAILED';
}

export interface PaymentRepositoryPort {
  save(payment: PaymentProps): Promise<void>;
  findById(id: string): Promise<PaymentProps | null>;
  findByOrderId(orderId: string): Promise<PaymentProps | null>;
  findByStatus?(status: 'PENDING' | 'AUTHORIZED' | 'PAID' | 'REFUNDED' | 'FAILED'): Promise<PaymentProps[]>;
  findPendingForReconciliation?(since?: Date): Promise<PaymentProps[]>;
}

export interface PayoutTransferRequest {
  providerId: string;
  recipientId: string;
  amount: bigint;
  idempotencyKey: string;
  metadata?: any;
}

export interface PayoutTransferResponse {
  externalId: string;
  status: 'PROCESSING' | 'PAID' | 'FAILED';
  fee: bigint;
}

export interface PayoutPort {
  transfer(request: PayoutTransferRequest): Promise<PayoutTransferResponse>;
  getBalance(recipientId: string): Promise<bigint>;
  getTransfer?(externalId: string): Promise<PayoutTransferResponse>;
}

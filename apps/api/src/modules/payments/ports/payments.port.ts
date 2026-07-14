import { PaymentEntity } from '../core/payment.entity';

export const PAYMENT_GATEWAY = Symbol('PAYMENT_GATEWAY');

export interface PaymentGatewayPort {
  /**
   * Transfers funds to the provider.
   * Returns a transaction reference string.
   */
  transferToProvider(providerId: string, amountCents: number): Promise<string>;
}

export const PAYMENTS_REPOSITORY = Symbol('PAYMENTS_REPOSITORY');

export interface PaymentsRepositoryPort {
  save(payment: PaymentEntity): Promise<void>;
  findById(id: string): Promise<PaymentEntity | null>;
}

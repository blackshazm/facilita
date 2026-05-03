export interface PaymentAuthorizeProps {
  orderId: string;
  amount: number; // In cents for internal consistency, but Pagar.me uses cents too
  customerId: string;
  paymentMethod: 'CARD' | 'PIX';
  cardToken?: string;
}

export interface PaymentResult {
  externalId: string;
  status: 'AUTHORIZED' | 'PAID' | 'FAILED' | 'PENDING';
  rawResponse?: any;
}

export interface PaymentGatewayPort {
  authorize(props: PaymentAuthorizeProps): Promise<PaymentResult>;
  capture(externalId: string, amount?: number): Promise<PaymentResult>;
  refund(externalId: string, amount?: number): Promise<PaymentResult>;
}

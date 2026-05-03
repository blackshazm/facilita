import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentGatewayPort } from '../ports/payment-gateway.port';
import { PaymentRepositoryPort } from '../ports/payment-repository.port';
import { PaymentAuthorizedEvent } from '../../../shared/events/events';
import { v4 as uuid } from 'uuid';

export interface AuthorizePaymentInput {
  orderId: string;
  amount: number;
  customerId: string;
  paymentMethod: 'CARD' | 'PIX';
  cardToken?: string;
}

@Injectable()
export class AuthorizePaymentUseCase {
  constructor(
    @Inject('PaymentGatewayPort')
    private readonly gateway: PaymentGatewayPort,
    @Inject('PaymentRepositoryPort')
    private readonly repository: PaymentRepositoryPort,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(input: AuthorizePaymentInput): Promise<void> {
    // 1. Authorize with gateway (Auth-only)
    const result = await this.gateway.authorize({
      orderId: input.orderId,
      amount: input.amount,
      customerId: input.customerId,
      paymentMethod: input.paymentMethod,
      cardToken: input.cardToken,
    });

    // 2. Save payment record
    const paymentId = uuid();
    await this.repository.save({
      id: paymentId,
      orderId: input.orderId,
      externalId: result.externalId,
      amount: input.amount,
      method: input.paymentMethod,
      status: result.status,
    });

    // 3. Emit event if authorized
    if (result.status === 'AUTHORIZED' || result.status === 'PAID') {
      this.eventEmitter.emit(
        'payment.authorized',
        new PaymentAuthorizedEvent(paymentId, input.amount),
      );
    }
  }
}

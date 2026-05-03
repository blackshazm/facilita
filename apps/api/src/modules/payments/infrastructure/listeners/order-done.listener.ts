import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OrderDoneEvent } from '../../../../shared/events/events';
import { CapturePaymentUseCase } from '../../application/capture-payment.usecase';

@Injectable()
export class OrderDoneListener {
  constructor(
    private readonly capturePayment: CapturePaymentUseCase,
  ) {}

  @OnEvent('order.done')
  async handleOrderDone(event: OrderDoneEvent) {
    await this.capturePayment.execute(event.orderId, event.providerId);
  }
}

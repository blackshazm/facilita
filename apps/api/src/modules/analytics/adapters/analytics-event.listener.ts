import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OrderDoneEvent, OrderMatchedEvent, PaymentCapturedEvent } from '../../../shared/events/events';
import { UpdateDailyMetricUseCase } from '../application/use-cases/update-daily-metric.usecase';

@Injectable()
export class AnalyticsEventListener {
  constructor(private readonly updateDailyMetric: UpdateDailyMetricUseCase) {}

  @OnEvent('order.matched')
  async handleOrderMatched(event: OrderMatchedEvent) {
    await this.updateDailyMetric.execute({ matchesCount: 1 });
  }

  @OnEvent('order.done')
  async handleOrderDone(event: OrderDoneEvent) {
    await this.updateDailyMetric.execute({ 
      ordersCount: 1,
      gmv: event.amount 
    });
  }

  @OnEvent('payment.captured')
  async handlePaymentCaptured(event: PaymentCapturedEvent) {
    await this.updateDailyMetric.execute({ 
      revenue: event.fee 
    });
  }
}

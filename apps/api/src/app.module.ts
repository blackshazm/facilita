import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { IdentityModule } from './modules/identity/identity.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { MatchingModule } from './modules/matching/matching.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { FraudModule } from './modules/fraud/fraud.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { FiscalModule } from './modules/fiscal/fiscal.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SharedKernelModule } from './shared-kernel/shared-kernel.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { TrackingModule } from './modules/tracking/tracking.module';
import { HealthModule } from './modules/health/health.module';
import { MetricsModule } from './modules/metrics/metrics.module';

import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    EventEmitterModule.forRoot(),
    HealthModule,
    MetricsModule,
    IdentityModule,
    CatalogModule,
    MatchingModule,
    OrdersModule,
    PaymentsModule,
    FraudModule,
    AnalyticsModule,
    FiscalModule,
    NotificationsModule,
    SharedKernelModule,
    ReviewsModule,
    TrackingModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { IdentityModule } from './modules/identity/identity.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { MatchingModule } from './modules/matching/matching.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { FraudModule } from './modules/fraud/fraud.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    EventEmitterModule.forRoot(),
    IdentityModule,
    CatalogModule,
    MatchingModule,
    OrdersModule,
    PaymentsModule,
    FraudModule,
  ],
})
export class AppModule {}

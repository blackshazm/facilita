import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { IdentityModule } from './modules/identity/identity.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    IdentityModule,
  ],
})
export class AppModule {}

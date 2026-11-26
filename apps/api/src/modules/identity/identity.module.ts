import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './interface/auth.controller';
import { AuthService } from './application/auth.service';
import { TwilioSmsService } from './infrastructure/twilio-sms.service';
import { SMS_SERVICE } from './domain/interfaces/sms.service.interface';
import { JwtStrategy } from '../../shared-kernel/strategies/jwt.strategy';
import { PrismaService } from '../../shared-kernel/database/prisma.service';
import { USER_REPOSITORY_PORT } from './ports/user-repository.port';
import { PrismaUserRepository } from './adapters/prisma-user-repository.adapter';
import { PrismaProviderRepository } from './adapters/prisma-provider-repository.adapter';
import { PROVIDER_REPOSITORY_PORT } from './ports/provider-repository.port';
import { GetUserUseCase } from './application/get-user.usecase';

import { BullModule } from '@nestjs/bullmq';
import { TierRecalculationProcessor } from './infrastructure/queues/tier-recalculation.processor';
import { UpdateProviderRatingListener } from './infrastructure/listeners/update-provider-rating.listener';

import { TieringSchedulerService } from './application/tiering-scheduler.service';
import { KycController } from './interface/kyc.controller';
import { ProviderController } from './interface/provider.controller';
import { AddressController } from './interface/address.controller';
import { KycService } from './application/kyc.service';
import { StoragePort } from './ports/storage.port';
import { CloudflareR2StorageAdapter } from './infrastructure/cloudflare-r2-storage.adapter';
import { FraudModule } from '../fraud/fraud.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret',
      signOptions: { expiresIn: '7d' },
    }),
    BullModule.registerQueue({
      name: 'tiering',
    }),
    FraudModule,
  ],
  controllers: [AuthController, KycController, ProviderController, AddressController],
  providers: [
    AuthService,
    JwtStrategy,
    PrismaService,
    GetUserUseCase,
    TierRecalculationProcessor,
    UpdateProviderRatingListener,
    TieringSchedulerService,
    {
      provide: SMS_SERVICE,
      useClass: TwilioSmsService,
    },
    {
      provide: USER_REPOSITORY_PORT,
      useClass: PrismaUserRepository,
    },
    {
      provide: PROVIDER_REPOSITORY_PORT,
      useClass: PrismaProviderRepository,
    },
    KycService,
    {
      provide: StoragePort,
      useClass: CloudflareR2StorageAdapter,
    },
  ],
  exports: [USER_REPOSITORY_PORT, PROVIDER_REPOSITORY_PORT, GetUserUseCase],
})
export class IdentityModule {}

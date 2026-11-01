import { Module } from '@nestjs/common';
import { PrismaService } from '../../shared-kernel/database/prisma.service';
import { VelocityDetectorListener } from './infrastructure/listeners/velocity-detector.listener';
import { ChecagemBackgroundCheckAdapter } from './infrastructure/adapters/checagem-background-check.adapter';
import { TruoraKycAdapter } from './infrastructure/adapters/truora-kyc.adapter';
import { ReceitaFederalMeiAdapter } from './infrastructure/adapters/receita-federal-mei.adapter';
import { RunProviderVerificationUseCase } from './application/run-provider-verification.usecase';
import { BACKGROUND_CHECK_PORT } from './ports/background-check.port';
import { KYC_VERIFICATION_PORT } from './ports/kyc-verification.port';
import { MEI_VALIDATION_PORT } from './ports/mei-validation.port';
import { AdminKycController } from './interface/admin-kyc.controller';

@Module({
  controllers: [AdminKycController],
  providers: [
    PrismaService,
    VelocityDetectorListener,

    // Adapters concretos (infrastructure)
    {
      provide: BACKGROUND_CHECK_PORT,
      useClass: ChecagemBackgroundCheckAdapter,
    },
    {
      provide: KYC_VERIFICATION_PORT,
      useClass: TruoraKycAdapter,
    },
    {
      provide: MEI_VALIDATION_PORT,
      useClass: ReceitaFederalMeiAdapter,
    },

    // Use Cases (application)
    RunProviderVerificationUseCase,
  ],
  exports: [RunProviderVerificationUseCase],
})
export class FraudModule {}

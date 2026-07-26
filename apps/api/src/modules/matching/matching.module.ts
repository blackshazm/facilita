import { Module } from '@nestjs/common';
import { PrismaService } from '../../shared-kernel/database/prisma.service';
import { MATCHING_ENGINE_PORT } from './ports/matching-engine.port';
import { MatchingController } from './interface/matching.controller';
import { ProviderStatusListener } from './infrastructure/provider-status.listener';
import { TrackingGateway } from './infrastructure/gateways/tracking.gateway';
import { SmartDispatchService } from './application/services/smart-dispatch.service';
import { PostgisMatchingAdapter } from './adapters/postgis-matching.adapter';
import { MatchProviderUseCase } from './application/match-provider.usecase';
import { MatchingGateway } from './adapters/matching.gateway';

@Module({
  providers: [
    PrismaService,
    MatchProviderUseCase,
    MatchingGateway,
    {
      provide: MATCHING_ENGINE_PORT,
      useClass: PostgisMatchingAdapter,
    },
    ProviderStatusListener,
    TrackingGateway,
    SmartDispatchService,
  ],
  exports: [SmartDispatchService, MatchProviderUseCase],
})
export class MatchingModule {}

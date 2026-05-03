import { Module } from '@nestjs/common';
import { PrismaService } from '../../shared-kernel/database/prisma.service';
import { MATCHING_ENGINE_PORT } from './ports/matching-engine.port';
import { PostgisMatchingAdapter } from './adapters/postgis-matching.adapter';
import { MatchProviderUseCase } from './application/match-provider.usecase';

@Module({
  providers: [
    PrismaService,
    MatchProviderUseCase,
    {
      provide: MATCHING_ENGINE_PORT,
      useClass: PostgisMatchingAdapter,
    },
  ],
  exports: [MatchProviderUseCase],
})
export class MatchingModule {}

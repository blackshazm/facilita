import { Module } from '@nestjs/common';
import { MatchingController } from './interface/matching.controller';
import { MatchingService } from './application/matching.service';
import { ProviderStatusListener } from './infrastructure/provider-status.listener';
import { PrismaService } from '../../shared-kernel/database/prisma.service';

@Module({
  controllers: [MatchingController],
  providers: [MatchingService, ProviderStatusListener, PrismaService],
})
export class MatchingModule {}

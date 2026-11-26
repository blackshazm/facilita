import { Module } from '@nestjs/common';
import { PrismaService } from '../../shared-kernel/database/prisma.service';
import { DISPUTE_REPOSITORY_PORT } from './ports/dispute-repository.port';
import { PrismaDisputeRepository } from './infrastructure/prisma-dispute-repository.adapter';
import { OpenDisputeUseCase } from './application/open-dispute.usecase';
import { ResolveDisputeUseCase } from './application/resolve-dispute.usecase';
import { ListDisputesUseCase } from './application/list-disputes.usecase';
import { DisputeController } from './interface/dispute.controller';

@Module({
  controllers: [DisputeController],
  providers: [
    PrismaService,
    OpenDisputeUseCase,
    ResolveDisputeUseCase,
    ListDisputesUseCase,
    {
      provide: DISPUTE_REPOSITORY_PORT,
      useClass: PrismaDisputeRepository,
    },
  ],
  exports: [
    OpenDisputeUseCase,
    ResolveDisputeUseCase,
    ListDisputesUseCase,
    DISPUTE_REPOSITORY_PORT,
  ],
})
export class DisputesModule {}

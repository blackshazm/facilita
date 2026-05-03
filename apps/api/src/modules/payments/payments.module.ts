import { Module } from '@nestjs/common';
import { PrismaService } from '../../shared-kernel/database/prisma.service';
import { PrismaWalletRepository } from './adapters/prisma-wallet-repository.adapter';

@Module({
  providers: [
    PrismaService,
    {
      provide: 'WalletRepositoryPort',
      useClass: PrismaWalletRepository,
    },
  ],
  exports: ['WalletRepositoryPort'],
})
export class PaymentsModule {}

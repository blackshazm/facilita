import { Global, Module } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';
import { FinancialAuditService } from './services/financial-audit.service';

@Global()
@Module({
  providers: [PrismaService, FinancialAuditService],
  exports: [PrismaService, FinancialAuditService],
})
export class SharedKernelModule {}

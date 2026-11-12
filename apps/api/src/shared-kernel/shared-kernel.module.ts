import { Global, Module } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';
import { FinancialAuditService } from './services/financial-audit.service';
import { IdempotencyInterceptor } from './interceptors/idempotency.interceptor';

@Global()
@Module({
  providers: [PrismaService, FinancialAuditService, IdempotencyInterceptor],
  exports: [PrismaService, FinancialAuditService, IdempotencyInterceptor],
})
export class SharedKernelModule {}

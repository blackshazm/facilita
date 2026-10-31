import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { SharedKernelModule } from '../../shared-kernel/shared-kernel.module';

@Module({
  imports: [SharedKernelModule],
  controllers: [HealthController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}


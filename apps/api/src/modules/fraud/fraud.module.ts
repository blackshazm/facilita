import { Module } from '@nestjs/common';
import { PrismaService } from '../../shared-kernel/database/prisma.service';
import { VelocityDetectorListener } from './infrastructure/listeners/velocity-detector.listener';

@Module({
  providers: [PrismaService, VelocityDetectorListener],
})
export class FraudModule {}

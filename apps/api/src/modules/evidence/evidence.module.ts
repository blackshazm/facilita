import { Module } from '@nestjs/common';
import { PrismaService } from '../../shared-kernel/database/prisma.service';
import { METADATA_EXTRACTOR_PORT } from './ports/metadata-extractor.port';
import { ExifMetadataExtractorAdapter } from './adapters/exif-metadata-extractor.adapter';
import { ValidateEvidenceUseCase } from './application/validate-evidence.usecase';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [OrdersModule],
  providers: [
    PrismaService,
    ValidateEvidenceUseCase,
    {
      provide: METADATA_EXTRACTOR_PORT,
      useClass: ExifMetadataExtractorAdapter,
    },
  ],
  exports: [ValidateEvidenceUseCase],
})
export class EvidenceModule {}

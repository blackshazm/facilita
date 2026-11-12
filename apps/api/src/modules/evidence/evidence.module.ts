import { Module } from '@nestjs/common';
import { PrismaService } from '../../shared-kernel/database/prisma.service';
import { METADATA_EXTRACTOR_PORT } from './ports/metadata-extractor.port';
import { ExifMetadataExtractorAdapter } from './adapters/exif-metadata-extractor.adapter';
import { ValidateEvidenceUseCase } from './application/validate-evidence.usecase';
import { ImageCompressorService } from './application/image-compressor.service';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [OrdersModule],
  providers: [
    PrismaService,
    ValidateEvidenceUseCase,
    ImageCompressorService,
    {
      provide: METADATA_EXTRACTOR_PORT,
      useClass: ExifMetadataExtractorAdapter,
    },
  ],
  exports: [ValidateEvidenceUseCase, ImageCompressorService],
})
export class EvidenceModule {}

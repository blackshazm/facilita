import { Injectable } from '@nestjs/common';
import * as ExifParser from 'exif-parser';
import { MetadataExtractorPort } from '../ports/metadata-extractor.port';
import { EvidenceMetadata } from '../core/evidence.entity';

@Injectable()
export class ExifMetadataExtractorAdapter implements MetadataExtractorPort {
  async extract(imageBuffer: Buffer): Promise<EvidenceMetadata> {
    try {
      const parser = ExifParser.create(imageBuffer);
      const result = parser.parse();

      return {
        latitude: result.tags.GPSLatitude,
        longitude: result.tags.GPSLongitude,
        capturedAt: result.tags.DateTimeOriginal ? new Date(result.tags.DateTimeOriginal * 1000) : undefined,
        deviceInfo: `${result.tags.Make} ${result.tags.Model}`.trim(),
      };
    } catch (error) {
      console.error('[Evidence] Failed to extract metadata:', error);
      return {};
    }
  }
}

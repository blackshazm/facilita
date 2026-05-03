import { EvidenceMetadata } from '../core/evidence.entity';

export interface MetadataExtractorPort {
  extract(imageBuffer: Buffer): Promise<EvidenceMetadata>;
}

export const METADATA_EXTRACTOR_PORT = Symbol('MetadataExtractorPort');

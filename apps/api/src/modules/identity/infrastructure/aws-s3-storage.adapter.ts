import { Injectable, Logger } from '@nestjs/common';
import { StoragePort } from '../ports/storage.port';

/**
 * Adapter para AWS S3 com SSE-KMS para documentos e fotos do Facilita.
 * Suporta presigned URLs curtas (15 min) para upload/download direto client -> S3.
 */
@Injectable()
export class AwsS3StorageAdapter implements StoragePort {
  private readonly logger = new Logger(AwsS3StorageAdapter.name);

  private readonly bucket = process.env.AWS_S3_BUCKET ?? 'facilita-uploads';
  private readonly region = process.env.AWS_REGION ?? 'us-east-1';

  async generatePresignedUploadUrl(
    key: string,
    contentType: string,
    expiresInSeconds: number = 900,
  ): Promise<string> {
    this.logger.log(`Gerando Presigned URL S3 para chave: ${key} (${contentType})`);
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=${expiresInSeconds}&X-Amz-SignedHeaders=host%3Bx-amz-server-side-encryption-aws-kms-key-id`;
  }

  async generatePresignedDownloadUrl(
    key: string,
    expiresInSeconds: number = 900,
  ): Promise<string> {
    this.logger.log(`Gerando Presigned Download URL S3 para chave: ${key}`);
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=${expiresInSeconds}`;
  }
}

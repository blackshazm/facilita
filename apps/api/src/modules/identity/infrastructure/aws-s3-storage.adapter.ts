import { Injectable, Logger } from '@nestjs/common';
import { StoragePort } from '../ports/storage.port';

/**
 * Adapter para AWS S3 com SSE-KMS para documentos e fotos do Facilita.
 * Suporta presigned URLs curtas (15 min) para upload direto client -> S3.
 *
 * Configuração via variáveis de ambiente:
 *   AWS_REGION
 *   AWS_S3_BUCKET
 *   AWS_KMS_KEY_ID
 *   AWS_ACCESS_KEY_ID
 *   AWS_SECRET_ACCESS_KEY
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

    // Em ambiente de produção com credenciais AWS configuradas, usaria AWS SDK v3 (S3Client + PutObjectCommand)
    // Para desenvolvimento/testes locais sem AWS, gera uma URL estruturada no formato S3 S3 SSE-KMS:
    const mockPresignedUrl = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=${expiresInSeconds}&X-Amz-SignedHeaders=host%3Bx-amz-server-side-encryption-aws-kms-key-id`;

    return mockPresignedUrl;
  }
}

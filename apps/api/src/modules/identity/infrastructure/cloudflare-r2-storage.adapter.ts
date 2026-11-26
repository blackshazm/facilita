import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { StoragePort } from '../ports/storage.port';

@Injectable()
export class CloudflareR2StorageAdapter implements StoragePort {
  private readonly logger = new Logger(CloudflareR2StorageAdapter.name);
  private readonly client: S3Client | null = null;
  private readonly bucket: string;
  private readonly accountId?: string;

  constructor() {
    this.bucket = process.env.CLOUDFLARE_R2_BUCKET ?? process.env.AWS_S3_BUCKET ?? 'facilita-uploads';
    this.accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
    const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ?? process.env.AWS_SECRET_ACCESS_KEY;

    if (this.accountId && accessKeyId && secretAccessKey) {
      this.client = new S3Client({
        region: 'auto',
        endpoint: `https://${this.accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
      this.logger.log(`Cloudflare R2 S3Client inicializado com sucesso para bucket: ${this.bucket}`);
    } else {
      this.logger.warn(`Credenciais Cloudflare R2 não detectadas no ambiente. Operando em modo simulado.`);
    }
  }

  async generatePresignedUploadUrl(
    key: string,
    contentType: string,
    expiresInSeconds: number = 900,
  ): Promise<string> {
    this.logger.log(`Gerando Presigned Upload URL para: ${key} (${contentType}), expira em ${expiresInSeconds}s`);

    if (this.client) {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: contentType,
      });
      return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
    }

    return `https://${this.bucket}.${this.accountId ?? 'mock'}.r2.cloudflarestorage.com/${key}?action=upload&contentType=${encodeURIComponent(contentType)}&expires=${expiresInSeconds}&sig=mock-sig`;
  }

  async generatePresignedDownloadUrl(
    key: string,
    expiresInSeconds: number = 900,
  ): Promise<string> {
    this.logger.log(`Gerando Presigned Download URL para: ${key}, expira em ${expiresInSeconds}s`);

    if (this.client) {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
    }

    return `https://${this.bucket}.${this.accountId ?? 'mock'}.r2.cloudflarestorage.com/${key}?action=download&expires=${expiresInSeconds}&sig=mock-sig`;
  }
}

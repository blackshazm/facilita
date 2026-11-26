import { Injectable } from '@nestjs/common';
import { StoragePort } from '../ports/storage.port';

@Injectable()
export class MockStorageAdapter implements StoragePort {
  async generatePresignedUploadUrl(
    key: string,
    contentType: string,
    expiresInSeconds: number = 900,
  ): Promise<string> {
    return `https://mock-storage.facilita.com.br/${key}?contentType=${contentType}&expires=${expiresInSeconds}`;
  }

  async generatePresignedDownloadUrl(
    key: string,
    expiresInSeconds: number = 900,
  ): Promise<string> {
    return `https://mock-storage.facilita.com.br/${key}?expires=${expiresInSeconds}`;
  }
}

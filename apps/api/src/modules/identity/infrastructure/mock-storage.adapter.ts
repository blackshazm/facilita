import { Injectable } from '@nestjs/common';
import { StoragePort } from '../ports/storage.port';

@Injectable()
export class MockStorageAdapter implements StoragePort {
  async generatePresignedUploadUrl(
    key: string,
    contentType: string,
    expiresInSeconds: number,
  ): Promise<string> {
    // Em produção, aqui integraríamos com AWS S3, Cloudinary ou Firebase Storage
    // Para o mock, retornamos uma URL simulada que contém as informações da requisição
    return `https://mock-storage.facilita.com.br/${key}?contentType=${contentType}&expires=${expiresInSeconds}`;
  }
}

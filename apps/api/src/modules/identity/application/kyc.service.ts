import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { StoragePort } from '../ports/storage.port';
import { PrismaService } from '../../../shared-kernel/database/prisma.service';

@Injectable()
export class KycService {
  private readonly logger = new Logger(KycService.name);

  constructor(
    private readonly storage: StoragePort,
    private readonly prisma: PrismaService,
  ) {}

  async getUploadUrl(
    userId: string,
    type: 'selfie' | 'document_front' | 'document_back',
    mimeType: string,
  ) {
    // V2 Hardening: Validação de tipos permitidos
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(mimeType)) {
      throw new BadRequestException('Formato de arquivo não suportado. Use JPEG, PNG ou WEBP.');
    }

    const key = `kyc/${userId}/${type}-${Date.now()}`;
    
    // V2 Hardening: Expiração curta de 15 minutos (900s)
    const url = await this.storage.generatePresignedUploadUrl(key, mimeType, 900);

    this.logger.log(`URL de upload gerada para o usuário ${userId} (${type})`);

    return {
      url,
      key,
      expiresIn: 900,
    };
  }

  async submit(
    userId: string,
    data: {
      selfieKey: string;
      documentFrontKey: string;
      documentBackKey?: string;
    },
  ) {
    this.logger.log(`Submissão de KYC recebida para o usuário ${userId}`);

    const submission = await this.prisma.kycSubmission.create({
      data: {
        userId,
        selfieUrl: data.selfieKey,
        documentFrontUrl: data.documentFrontKey,
        documentBackUrl: data.documentBackKey,
        status: 'PENDING',
      },
    });

    // Em um fluxo real, aqui poderíamos disparar um evento para revisão humana ou IA
    // Por enquanto, apenas registramos no banco.

    return submission;
  }
}

import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
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

    return submission;
  }

  async listPendingSubmissions() {
    this.logger.log('Buscando submissões de KYC pendentes de moderação');

    const submissions = await this.prisma.kycSubmission.findMany({
      where: { status: 'PENDING' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            profile: {
              select: {
                cpfCnpj: true,
                tier: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(
      submissions.map(async (sub) => {
        const docUrl = await this.storage.generatePresignedDownloadUrl(sub.documentFrontUrl, 900);
        const proofUrl = await this.storage.generatePresignedDownloadUrl(sub.selfieUrl, 900);
        const docBackUrl = sub.documentBackUrl
          ? await this.storage.generatePresignedDownloadUrl(sub.documentBackUrl, 900)
          : null;

        return {
          id: sub.id,
          userId: sub.userId,
          name: sub.user?.name ?? 'Prestador Sem Nome',
          cpf: sub.user?.profile?.cpfCnpj ?? 'Não informado',
          phone: sub.user?.phone ?? 'Não informado',
          specialty: 'Prestador Verificado',
          pixKey: sub.user?.profile?.cpfCnpj ?? 'Não cadastrada',
          submittedAt: sub.createdAt.toISOString(),
          docType: 'Documento de Identidade Oficial',
          docUrl,
          proofUrl,
          docBackUrl,
          status: sub.status,
          rejectionReason: sub.rejectionReason,
        };
      }),
    );
  }

  async approveSubmission(submissionId: string, adminId?: string) {
    this.logger.log(`Aprovando submissão de KYC ${submissionId} por admin ${adminId ?? 'system'}`);

    const submission = await this.prisma.kycSubmission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new NotFoundException(`Submissão KYC ID ${submissionId} não encontrada`);
    }

    const updated = await this.prisma.kycSubmission.update({
      where: { id: submissionId },
      data: {
        status: 'APPROVED',
        rejectionReason: null,
      },
    });

    await this.prisma.user.update({
      where: { id: submission.userId },
      data: { isVerified: true },
    });

    if (adminId) {
      await this.prisma.auditLog.create({
        data: {
          adminId,
          targetId: submission.userId,
          action: 'KYC_APPROVED',
          reason: 'Aprovado via Central de Moderação Administrativa',
        },
      });
    }

    return updated;
  }

  async rejectSubmission(submissionId: string, reason: string, adminId?: string) {
    this.logger.log(`Rejeitando submissão de KYC ${submissionId}. Motivo: ${reason}`);

    const submission = await this.prisma.kycSubmission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new NotFoundException(`Submissão KYC ID ${submissionId} não encontrada`);
    }

    const rejectionReason = reason || 'Documento ilegível, cortado ou divergente dos dados cadastrais';

    const updated = await this.prisma.kycSubmission.update({
      where: { id: submissionId },
      data: {
        status: 'REJECTED',
        rejectionReason,
      },
    });

    await this.prisma.user.update({
      where: { id: submission.userId },
      data: { isVerified: false },
    });

    if (adminId) {
      await this.prisma.auditLog.create({
        data: {
          adminId,
          targetId: submission.userId,
          action: 'KYC_REJECTED',
          reason: rejectionReason,
        },
      });
    }

    return updated;
  }
}

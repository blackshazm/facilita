import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../../shared-kernel/database/prisma.service';
import { BACKGROUND_CHECK_PORT, BackgroundCheckPort, BackgroundCheckResult } from '../ports/background-check.port';
import { KYC_VERIFICATION_PORT, KycVerificationPort } from '../ports/kyc-verification.port';
import { MEI_VALIDATION_PORT, MeiValidationPort } from '../ports/mei-validation.port';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface ProviderVerificationInput {
  providerId: string;
  userId: string;
  cpf: string;
  cnpj: string;
  selfieUrl: string;
  documentUrl: string;
  documentType: 'RG' | 'CNH';
}

export interface ProviderVerificationResult {
  providerId: string;
  status: 'APPROVED' | 'BLOCKED' | 'MANUAL_REVIEW';
  blockReason?: string;
  backgroundCheck?: BackgroundCheckResult;
}

/**
 * Orquestra todas as verificações de segurança de um prestador:
 *   1. Background Check (Checagem.com)
 *   2. KYC Biométrico (Truora)
 *   3. Validação de MEI (Receita Federal)
 *
 * Regras:
 *   - Background Check MAJOR → BLOCKED automaticamente
 *   - KYC REJECTED (score < 85) → MANUAL_REVIEW (3 tentativas máx)
 *   - MEI inativo → BLOCKED
 *   - Todos OK → APPROVED
 */
@Injectable()
export class RunProviderVerificationUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(BACKGROUND_CHECK_PORT) private readonly backgroundCheck: BackgroundCheckPort,
    @Inject(KYC_VERIFICATION_PORT) private readonly kycVerification: KycVerificationPort,
    @Inject(MEI_VALIDATION_PORT) private readonly meiValidation: MeiValidationPort,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(input: ProviderVerificationInput): Promise<ProviderVerificationResult> {
    // 1. Validar MEI
    const meiResult = await this.meiValidation.validate(input.cnpj);
    if (!meiResult.isActive) {
      await this.blockProvider(input.providerId, 'MEI_INACTIVE');
      return {
        providerId: input.providerId,
        status: 'BLOCKED',
        blockReason: 'MEI_INACTIVE',
      };
    }

    // 2. Background Check
    const bgResult = await this.backgroundCheck.check(input.cpf);
    if (bgResult.severity === 'MAJOR') {
      await this.blockProvider(input.providerId, 'CRIMINAL_RECORD_MAJOR');
      return {
        providerId: input.providerId,
        status: 'BLOCKED',
        blockReason: 'CRIMINAL_RECORD_MAJOR',
        backgroundCheck: bgResult,
      };
    }

    // 3. KYC Biométrico
    const kycResult = await this.kycVerification.verifySelfieDocument(
      input.selfieUrl,
      input.documentUrl,
      input.documentType,
    );

    if (kycResult.status === 'REJECTED') {
      // Força revisão manual — não bloqueia diretamente
      await this.flagForManualReview(input.providerId, 'KYC_FACE_MISMATCH', {
        kycScore: kycResult.matchScore,
        reason: kycResult.rejectionReason,
        backgroundSeverity: bgResult.severity,
      });
      return {
        providerId: input.providerId,
        status: 'MANUAL_REVIEW',
        blockReason: 'KYC_FACE_MISMATCH',
      };
    }

    if (kycResult.status === 'MANUAL_REVIEW' || bgResult.severity === 'MINOR') {
      await this.flagForManualReview(input.providerId, 'REQUIRES_MANUAL_REVIEW', {
        kycScore: kycResult.matchScore,
        backgroundSeverity: bgResult.severity,
      });
      return {
        providerId: input.providerId,
        status: 'MANUAL_REVIEW',
      };
    }

    // Tudo OK → Aprovar
    await this.approveProvider(input.providerId);
    return {
      providerId: input.providerId,
      status: 'APPROVED',
      backgroundCheck: bgResult,
    };
  }

  private async blockProvider(providerId: string, reason: string): Promise<void> {
    await this.prisma.providerProfile.update({
      where: { userId: providerId },
      data: { isFlagged: true, fraudReason: reason },
    });

    this.eventEmitter.emit('provider.blocked', { providerId, reason });
  }

  private async approveProvider(providerId: string): Promise<void> {
    await this.prisma.providerProfile.update({
      where: { userId: providerId },
      data: { isFlagged: false, fraudReason: null },
    });

    this.eventEmitter.emit('provider.verified', { providerId });
  }

  private async flagForManualReview(
    providerId: string,
    reason: string,
    metadata: Record<string, unknown>,
  ): Promise<void> {
    // Registrar FraudSignal para fila de operação
    await (this.prisma as any).fraudSignal.create({
      data: {
        entityType: 'PROVIDER',
        entityId: providerId,
        signalType: reason,
        severity: 'HIGH',
        metadata,
        reviewed: false,
      },
    });

    this.eventEmitter.emit('provider.manual_review_required', { providerId, reason });
  }
}

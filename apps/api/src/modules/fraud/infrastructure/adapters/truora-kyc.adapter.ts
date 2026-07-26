import { Injectable, Logger } from '@nestjs/common';
import {
  KycVerificationPort,
  KycVerificationResult,
  KycVerificationStatus,
} from '../../ports/kyc-verification.port';

/**
 * Adapter concreto para Truora (KYC biométrico)
 * Documentação: https://docs.truora.com
 *
 * Fluxo:
 *   1. POST /v1/verifications — cria uma verificação
 *   2. GET  /v1/verifications/{id} — consulta resultado (polling ou webhook)
 *
 * Regra de negócio: matchScore >= 85 → APPROVED
 */
@Injectable()
export class TruoraKycAdapter implements KycVerificationPort {
  private readonly logger = new Logger(TruoraKycAdapter.name);

  private readonly apiKey = process.env.TRUORA_API_KEY;
  private readonly apiUrl = 'https://api.truora.com/v1';

  async verifySelfieDocument(
    selfieUrl: string,
    documentUrl: string,
    documentType: 'RG' | 'CNH',
  ): Promise<KycVerificationResult> {
    this.logger.log(`Iniciando verificação KYC Truora (documento: ${documentType})`);

    try {
      // Step 1: Criar verificação
      const verificationResponse = await fetch(`${this.apiUrl}/verifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Truora-API-Key': this.apiKey,
        },
        body: JSON.stringify({
          type: 'identity',
          country: 'BR',
          document_type: documentType === 'CNH' ? 'national-id' : 'rg',
          document_image_front: documentUrl,
          face_image: selfieUrl,
        }),
      });

      if (!verificationResponse.ok) {
        this.logger.error(`Truora retornou status ${verificationResponse.status}`);
        return this.pendingManualReview('API_ERROR');
      }

      const verification = await verificationResponse.json();
      return this.parseResponse(verification);
    } catch (error) {
      this.logger.error(`Erro ao chamar Truora: ${error.message}`);
      return this.pendingManualReview('NETWORK_ERROR');
    }
  }

  private parseResponse(data: any): KycVerificationResult {
    const matchScore = Math.round((data.validation_status?.face_match_score ?? 0) * 100);
    const apiStatus = data.status;

    let status: KycVerificationStatus;
    if (apiStatus === 'completed' && matchScore >= 85) {
      status = 'APPROVED';
    } else if (apiStatus === 'completed' && matchScore < 85) {
      status = 'REJECTED';
    } else if (apiStatus === 'failed') {
      status = 'REJECTED';
    } else {
      status = 'MANUAL_REVIEW';
    }

    this.logger.log(`KYC concluído: status=${status}, score=${matchScore}`);

    return {
      verificationId: data.verification_id ?? 'unknown',
      status,
      matchScore,
      rejectionReason: status === 'REJECTED' ? data.reason ?? 'FACE_MISMATCH' : undefined,
      rawData: data,
    };
  }

  private pendingManualReview(reason: string): KycVerificationResult {
    return {
      verificationId: `manual-${Date.now()}`,
      status: 'MANUAL_REVIEW',
      matchScore: 0,
      rejectionReason: reason,
    };
  }
}

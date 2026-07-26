export const KYC_VERIFICATION_PORT = 'KYC_VERIFICATION_PORT';

export type KycVerificationStatus = 'APPROVED' | 'REJECTED' | 'PENDING' | 'MANUAL_REVIEW';

export interface KycVerificationResult {
  verificationId: string;
  status: KycVerificationStatus;
  matchScore: number; // 0–100 (>= 85 = APPROVED)
  rejectionReason?: string;
  rawData?: Record<string, unknown>;
}

export interface KycVerificationPort {
  verifySelfieDocument(
    selfieUrl: string,
    documentUrl: string,
    documentType: 'RG' | 'CNH',
  ): Promise<KycVerificationResult>;
}

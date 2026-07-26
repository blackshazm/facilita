export const MEI_VALIDATION_PORT = 'MEI_VALIDATION_PORT';

export interface MeiValidationResult {
  cnpj: string;
  isActive: boolean;
  companyName?: string;
  openedAt?: string;
  legalNature?: string; // Should contain "Empresário Individual" for MEI
  situation?: string;   // Should be "ATIVA"
}

export interface MeiValidationPort {
  validate(cnpj: string): Promise<MeiValidationResult>;
}

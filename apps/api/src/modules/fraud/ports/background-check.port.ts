export const BACKGROUND_CHECK_PORT = 'BACKGROUND_CHECK_PORT';

export type BackgroundCheckSeverity = 'NONE' | 'MINOR' | 'MAJOR';

export interface BackgroundCheckResult {
  cpf: string;
  hasCriminalRecord: boolean;
  /**
   * NONE  — Sem ocorrências
   * MINOR — Ocorrências leves (não bloqueiam automaticamente)
   * MAJOR — Crimes graves (violência, estelionato) → bloqueio automático
   */
  severity: BackgroundCheckSeverity;
  crimes?: string[];
  rawData?: Record<string, unknown>;
}

export interface BackgroundCheckPort {
  check(cpf: string): Promise<BackgroundCheckResult>;
}

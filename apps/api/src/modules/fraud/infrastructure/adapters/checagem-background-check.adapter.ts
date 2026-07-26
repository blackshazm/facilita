import { Injectable, Logger } from '@nestjs/common';
import {
  BackgroundCheckPort,
  BackgroundCheckResult,
  BackgroundCheckSeverity,
} from '../../ports/background-check.port';

/**
 * Adapter concreto para Checagem.com
 * Documentação: https://docs.checagem.com.br
 *
 * Crimes graves (MAJOR) que resultam em bloqueio automático:
 *   - Homicídio, lesão corporal grave, latrocínio
 *   - Estelionato, fraude, crime financeiro
 *   - Crimes contra a dignidade sexual
 *   - Roubo, extorsão
 *
 * Crimes leves (MINOR) vão para revisão manual:
 *   - Contravenções
 *   - Crimes de trânsito sem vítima
 */
@Injectable()
export class ChecagemBackgroundCheckAdapter implements BackgroundCheckPort {
  private readonly logger = new Logger(ChecagemBackgroundCheckAdapter.name);

  private readonly apiKey = process.env.CHECAGEM_API_KEY;
  private readonly apiUrl = 'https://api.checagem.com.br/v1';

  // Palavras-chave que indicam crime MAJOR (bloqueio automático)
  private readonly MAJOR_CRIME_KEYWORDS = [
    'homicídio',
    'homicidio',
    'estelionato',
    'fraude',
    'latrocínio',
    'latrocinio',
    'estupro',
    'abuso sexual',
    'extorsão',
    'extorsao',
    'roubo',
    'sequestro',
    'corrupção',
    'corrupcao',
    'tráfico',
    'trafico',
    'lesão corporal grave',
    'lesao corporal grave',
  ];

  async check(cpf: string): Promise<BackgroundCheckResult> {
    this.logger.log(`Iniciando background check para CPF: ${cpf.slice(0, 3)}...`);

    try {
      const response = await fetch(`${this.apiUrl}/background-check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ cpf }),
      });

      if (!response.ok) {
        this.logger.error(`Checagem.com retornou status ${response.status}`);
        // Fail-open: em caso de falha na API, não bloqueia (vai para revisão manual)
        return this.failOpenResult(cpf);
      }

      const data = await response.json();
      return this.parseResponse(cpf, data);
    } catch (error) {
      this.logger.error(`Erro ao chamar Checagem.com: ${error.message}`);
      return this.failOpenResult(cpf);
    }
  }

  private parseResponse(cpf: string, data: any): BackgroundCheckResult {
    const crimes: string[] = data.occurrences?.map((o: any) => o.crime_type) ?? [];
    const hasCriminalRecord = crimes.length > 0;

    let severity: BackgroundCheckSeverity = 'NONE';
    if (hasCriminalRecord) {
      const isMajor = crimes.some((crime) =>
        this.MAJOR_CRIME_KEYWORDS.some((keyword) =>
          crime.toLowerCase().includes(keyword),
        ),
      );
      severity = isMajor ? 'MAJOR' : 'MINOR';
    }

    this.logger.log(`Background check concluído: severity=${severity}`);

    return {
      cpf,
      hasCriminalRecord,
      severity,
      crimes,
      rawData: data,
    };
  }

  /**
   * Fail-open: se a API falhar, não bloqueia o prestador automaticamente.
   * O caso vai para revisão manual via FraudSignal.
   */
  private failOpenResult(cpf: string): BackgroundCheckResult {
    return {
      cpf,
      hasCriminalRecord: false,
      severity: 'NONE',
      rawData: { error: 'API_UNAVAILABLE', requiresManualReview: true },
    };
  }
}

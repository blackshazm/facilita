import { Injectable, Logger } from '@nestjs/common';
import { MeiValidationPort, MeiValidationResult } from '../../ports/mei-validation.port';

/**
 * Adapter para validação de MEI via API pública do CNPJ.ws
 * Endpoint: GET https://publica.cnpj.ws/cnpj/{cnpj}
 * Sem autenticação necessária. Gratuito.
 *
 * Validações:
 *   - situacao_cadastral === "ATIVA"
 *   - natureza_juridica deve conter "213-5" (MEI - Microempreendedor Individual)
 */
@Injectable()
export class ReceitaFederalMeiAdapter implements MeiValidationPort {
  private readonly logger = new Logger(ReceitaFederalMeiAdapter.name);

  // Código de natureza jurídica do MEI na Receita Federal
  private readonly MEI_LEGAL_NATURE_CODE = '213-5';

  async validate(cnpj: string): Promise<MeiValidationResult> {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    this.logger.log(`Validando MEI para CNPJ: ${cleanCnpj}`);

    try {
      const response = await fetch(`https://publica.cnpj.ws/cnpj/${cleanCnpj}`);

      if (response.status === 404) {
        this.logger.warn(`CNPJ ${cleanCnpj} não encontrado na Receita Federal`);
        return { cnpj: cleanCnpj, isActive: false };
      }

      if (!response.ok) {
        this.logger.error(`API CNPJ.ws retornou status ${response.status}`);
        // Fail-open: em caso de indisponibilidade, não bloqueia automaticamente
        return { cnpj: cleanCnpj, isActive: true };
      }

      const data = await response.json();
      return this.parseResponse(cleanCnpj, data);
    } catch (error) {
      this.logger.error(`Erro ao validar MEI: ${error.message}`);
      return { cnpj: cleanCnpj, isActive: true }; // fail-open
    }
  }

  private parseResponse(cnpj: string, data: any): MeiValidationResult {
    const situacao = data.estabelecimento?.situacao_cadastral ?? '';
    const isActive = situacao.toUpperCase() === 'ATIVA';

    const legalNatureCode = data.natureza_juridica?.id ?? '';
    const legalNatureName = data.natureza_juridica?.descricao ?? '';
    const isMei = legalNatureCode === this.MEI_LEGAL_NATURE_CODE;

    if (!isMei) {
      this.logger.warn(`CNPJ ${cnpj} não é MEI (natureza: ${legalNatureName})`);
    }

    this.logger.log(
      `Validação MEI concluída — CNPJ: ${cnpj}, ativa: ${isActive}, é MEI: ${isMei}`,
    );

    return {
      cnpj,
      isActive: isActive && isMei,
      companyName: data.razao_social,
      openedAt: data.estabelecimento?.data_inicio_atividade,
      legalNature: legalNatureName,
      situation: situacao,
    };
  }
}

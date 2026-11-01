import { OrdemJaAceitaException } from './exceptions/ordem-ja-aceita.exception';

export enum OrdemServicoStatus {
  CRIADA = 'CRIADA',
  AGUARDANDO_PROFISSIONAL = 'AGUARDANDO_PROFISSIONAL',
  ACEITA = 'ACEITA',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  CONCLUIDA = 'CONCLUIDA',
}

export interface OrdemServicoProps {
  clienteId: string;
  profissionalId?: string;
  categoriaId: string;
  status?: OrdemServicoStatus;
  localizacao: { latitude: number; longitude: number };
  versao?: number;
}

export class OrdemServicoEntity {
  id: string;
  clienteId: string;
  profissionalId?: string;
  categoriaId: string;
  status: OrdemServicoStatus;
  localizacao: { latitude: number; longitude: number };
  versao: number;
  criadoEm: Date;
  atualizadoEm: Date;

  constructor(props: OrdemServicoProps, id?: string) {
    this.id = id || crypto.randomUUID();
    this.clienteId = props.clienteId;
    this.profissionalId = props.profissionalId;
    this.categoriaId = props.categoriaId;
    this.status = props.status || OrdemServicoStatus.CRIADA;
    this.localizacao = props.localizacao;
    this.versao = props.versao || 1;
    this.criadoEm = new Date();
    this.atualizadoEm = new Date();
  }

  // Exemplos de regras de negócio de mudança de estado
  aceitar(profissionalId: string) {
    if (this.status !== OrdemServicoStatus.AGUARDANDO_PROFISSIONAL || this.profissionalId) {
      if (this.status === OrdemServicoStatus.ACEITA || this.profissionalId) {
        throw new OrdemJaAceitaException();
      }
      throw new Error('Apenas ordens aguardando profissional podem ser aceitas');
    }
    this.status = OrdemServicoStatus.ACEITA;
    this.profissionalId = profissionalId;
    this.versao += 1;
    this.atualizadoEm = new Date();
  }

  iniciar() {
    if (this.status !== OrdemServicoStatus.ACEITA) {
      throw new Error('A ordem deve ser aceita antes de ser iniciada');
    }
    this.status = OrdemServicoStatus.EM_ANDAMENTO;
    this.atualizadoEm = new Date();
  }

  concluir() {
    if (this.status !== OrdemServicoStatus.EM_ANDAMENTO) {
      throw new Error('A ordem deve estar em andamento para ser concluída');
    }
    this.status = OrdemServicoStatus.CONCLUIDA;
    this.atualizadoEm = new Date();
  }
}

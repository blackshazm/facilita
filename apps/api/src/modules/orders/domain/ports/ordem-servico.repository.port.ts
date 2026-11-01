import { OrdemServicoEntity } from '../ordem-servico.entity';

export interface OrdemServicoRepositoryPort {
  salvar(ordemServico: OrdemServicoEntity): Promise<void>;
  buscarPorId(id: string): Promise<OrdemServicoEntity | null>;
}

export const ORDEM_SERVICO_REPOSITORY_PORT = Symbol('OrdemServicoRepositoryPort');

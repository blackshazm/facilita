export interface Localizacao {
  latitude: number;
  longitude: number;
}

export enum CategoriaProfissional {
  ENCANADOR = 'ENCANADOR',
  ELETRICISTA = 'ELETRICISTA',
  LIMPEZA = 'LIMPEZA',
  PINTOR = 'PINTOR',
  // etc
}

export enum StatusProfissional {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  EM_ATENDIMENTO = 'EM_ATENDIMENTO',
}

export class Profissional {
  constructor(
    public readonly id: string,
    public nome: string,
    public categoria: CategoriaProfissional,
    public status: StatusProfissional,
    public localizacaoAtual: Localizacao,
  ) {}
}

export interface ProfissionalRepositoryPort {
  /**
   * Busca profissionais cuja localização atual esteja dentro de um raio de X quilômetros
   * da localização do cliente, filtrando por Categoria e status ONLINE.
   *
   * @param localizacaoCliente - As coordenadas geográficas (latitude/longitude) do cliente
   * @param raioKm - O raio de busca em quilômetros
   * @param categoria - A categoria do serviço requisitado
   * @returns Uma promessa que resolve com a lista de profissionais elegíveis encontrados
   */
  buscarProfissionaisDisponiveisPorLocalizacaoEServico(
    localizacaoCliente: Localizacao,
    raioKm: number,
    categoria: CategoriaProfissional,
  ): Promise<Profissional[]>;
}

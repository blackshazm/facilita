import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrdemServicoEntity, OrdemServicoStatus } from '../../domain/ordem-servico.entity';
import {
  OrdemServicoRepositoryPort,
  ORDEM_SERVICO_REPOSITORY_PORT,
} from '../../domain/ports/ordem-servico.repository.port';
import { ServicoAguardandoCorrespondenciaEvent } from '../../domain/events/servico-aguardando-correspondencia.event';

export interface SolicitarServicoDto {
  clienteId: string;
  categoriaId: string;
  localizacao: {
    latitude: number;
    longitude: number;
  };
}

@Injectable()
export class SolicitarServicoUseCase {
  constructor(
    @Inject(ORDEM_SERVICO_REPOSITORY_PORT)
    private readonly ordemServicoRepository: OrdemServicoRepositoryPort,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async executar(dto: SolicitarServicoDto): Promise<OrdemServicoEntity> {
    // 1. Instanciar a entidade (já define o estado inicial como CRIADA)
    const ordemServico = new OrdemServicoEntity({
      clienteId: dto.clienteId,
      categoriaId: dto.categoriaId,
      localizacao: dto.localizacao,
      status: OrdemServicoStatus.CRIADA,
    });

    // 2. Persistir a entidade no repositório
    await this.ordemServicoRepository.salvar(ordemServico);

    // 3. Disparar evento de domínio 'ServiçoAguardandoCorrespondencia'
    const evento = new ServicoAguardandoCorrespondenciaEvent(
      ordemServico.id,
      ordemServico.clienteId,
      ordemServico.categoriaId,
      ordemServico.localizacao,
    );
    this.eventEmitter.emit('ServicoAguardandoCorrespondencia', evento);

    return ordemServico;
  }
}

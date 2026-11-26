import { AcceptServiceUseCase, AcceptServiceDto } from '../../ports/in/accept-service.use-case';
import { ServiceOrder } from '../../domain/entities/service-order.entity';
import { ServiceOrderRepositoryPort } from '../../ports/out/service-order.repository.port';

export class AcceptServiceService implements AcceptServiceUseCase {
  constructor(
    private readonly serviceOrderRepo: ServiceOrderRepositoryPort,
  ) {}

  async execute(dto: AcceptServiceDto): Promise<ServiceOrder> {
    // 1. Recuperar a ordem de serviço atual
    const order = await this.serviceOrderRepo.findById(dto.serviceOrderId);
    if (!order) {
      throw new Error('Ordem de serviço não encontrada.');
    }

    // 2. Acionar método de negócio para aceitar o serviço (Validações de Domínio)
    // Se a ordem já foi aceita, isto vai lançar exceção.
    order.accept(dto.professionalId);

    // 3. Atualizar com Optimistic Locking
    // A porta deverá tratar ConcurrencyException caso a 'version' atual 
    // difira daquela salva na base, garantindo que dois profissionais 
    // não consigam sobreescrever um ao outro em paralelo.
    await this.serviceOrderRepo.updateWithLock(order);

    return order;
  }
}

import { RequestServiceCommand, RequestServiceUseCase } from "../ports/inbound/RequestServiceUseCase";
import { ServiceOrder, ServiceOrderStatus } from "../domain/ServiceOrder";
import { ProfessionalRepositoryPort } from "../ports/outbound/ProfessionalRepositoryPort";
import { LocationValidationServicePort } from "../ports/outbound/LocationValidationServicePort";
import { GpsSignalFailedError, NoProfessionalFoundError } from "../domain/errors";
import { randomUUID } from "crypto";

export class RequestServiceService implements RequestServiceUseCase {
  private readonly SEARCH_RADIUS_KM = 5;

  constructor(
    private readonly professionalRepository: ProfessionalRepositoryPort,
    private readonly locationValidationService: LocationValidationServicePort
  ) {}

  async execute(command: RequestServiceCommand): Promise<ServiceOrder> {
    // 1. Validação robusta de GPS
    const isGpsValid = await this.locationValidationService.validateGpsSignal(command.location);
    if (!isGpsValid) {
      throw new GpsSignalFailedError(command.customerId);
    }

    // 2. Criação da Ordem de Serviço
    const order = new ServiceOrder(
      randomUUID(),
      command.customerId,
      command.categoryId,
      command.location,
      ServiceOrderStatus.CRIADA
    );

    // 3. Busca de profissionais disponíveis no raio especificado
    const availableProfessionals = await this.professionalRepository.findAvailableProfessionals(
      command.categoryId,
      command.location,
      this.SEARCH_RADIUS_KM
    );

    // 4. Tratamento de erro quando nenhum profissional é encontrado
    if (availableProfessionals.length === 0) {
      throw new NoProfessionalFoundError(command.categoryId, this.SEARCH_RADIUS_KM);
    }

    // 5. Transição de estado
    order.markAsAwaitingProfessional();

    // Aqui entraria a persistência da ordem de serviço e envio de evento para mensageria 
    // ou notificação push para os profissionais encontrados (Outbound Ports adicionais)

    return order;
  }
}

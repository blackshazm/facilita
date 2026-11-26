import { randomUUID } from 'crypto';
import { RequestServiceUseCase, RequestServiceDto } from '../../ports/in/request-service.use-case';
import { ServiceOrder, ServiceOrderStatus } from '../../domain/entities/service-order.entity';
import { Location } from '../../domain/entities/location.vo';
import { ServiceOrderRepositoryPort } from '../../ports/out/service-order.repository.port';
import { ProfessionalRepositoryPort } from '../../ports/out/professional.repository.port';
import { PushNotificationPort } from '../../ports/out/push-notification.port';

export class RequestServiceService implements RequestServiceUseCase {
  private readonly SEARCH_RADIUS_METERS = 5000;

  constructor(
    private readonly serviceOrderRepo: ServiceOrderRepositoryPort,
    private readonly professionalRepo: ProfessionalRepositoryPort,
    private readonly pushNotificationPort: PushNotificationPort,
  ) {}

  async execute(dto: RequestServiceDto): Promise<ServiceOrder> {
    const location = new Location(dto.location.latitude, dto.location.longitude);
    
    // 1. Criar a Ordem
    const order = new ServiceOrder(
      randomUUID(),
      dto.customerId,
      dto.category,
      location,
      ServiceOrderStatus.CRIADA,
    );
    
    // 2. Mudar status para AGUARDANDO_PROFISSIONAL
    order.requestMatching();

    // 3. Salvar no Banco
    await this.serviceOrderRepo.save(order);

    // 4. Buscar profissionais próximos (PostGIS / Raio de 5km)
    const nearbyProfessionals = await this.professionalRepo.findAvailableNearby(
      order.category,
      order.location,
      this.SEARCH_RADIUS_METERS,
    );

    // 5. Notificar os profissionais encontrados
    if (nearbyProfessionals.length > 0) {
      const professionalIds = nearbyProfessionals.map((p) => p.id);
      await this.pushNotificationPort.notifyProfessionals(professionalIds, order);
    }

    return order;
  }
}

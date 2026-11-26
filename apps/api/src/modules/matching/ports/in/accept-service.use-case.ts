import { ServiceOrder } from '../../domain/entities/service-order.entity';

export interface AcceptServiceDto {
  professionalId: string;
  serviceOrderId: string;
}

export interface AcceptServiceUseCase {
  execute(dto: AcceptServiceDto): Promise<ServiceOrder>;
}

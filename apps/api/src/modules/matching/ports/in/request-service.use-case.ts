import { ServiceOrder } from '../../domain/entities/service-order.entity';
import { Location } from '../../domain/entities/location.vo';

export interface RequestServiceDto {
  customerId: string;
  category: string;
  location: { latitude: number; longitude: number };
}

export interface RequestServiceUseCase {
  execute(dto: RequestServiceDto): Promise<ServiceOrder>;
}

// PRD: 4.1 Catálogo de Serviços
import { ServiceItem, ServiceCategory } from '../core/service.entity';

export const CATALOG_REPOSITORY = Symbol('CATALOG_REPOSITORY');

export interface CatalogRepositoryPort {
  findAllActive(): Promise<ServiceItem[]>;
  findByCategory(category: ServiceCategory): Promise<ServiceItem[]>;
  findById(id: string): Promise<ServiceItem | null>;
}

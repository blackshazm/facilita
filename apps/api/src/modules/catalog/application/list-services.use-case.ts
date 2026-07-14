// PRD: 4.1 Catálogo de Serviços
import { Inject, Injectable } from '@nestjs/common';
import { ServiceItem, ServiceCategory } from '../core/service.entity';
import { CATALOG_REPOSITORY, CatalogRepositoryPort } from '../ports/catalog.repository.port';

@Injectable()
export class ListServicesUseCase {
  constructor(
    @Inject(CATALOG_REPOSITORY)
    private readonly catalogRepository: CatalogRepositoryPort,
  ) {}

  async execute(category?: ServiceCategory): Promise<ServiceItem[]> {
    if (category) {
      return this.catalogRepository.findByCategory(category);
    }
    return this.catalogRepository.findAllActive();
  }
}

import { Injectable, Inject } from '@nestjs/common';
import { CATALOG_REPOSITORY_PORT, CatalogRepositoryPort } from '../ports/catalog-repository.port';

@Injectable()
export class GetCatalogUseCase {
  constructor(
    @Inject(CATALOG_REPOSITORY_PORT)
    private readonly catalogRepository: CatalogRepositoryPort,
  ) {}

  async execute() {
    const categories = await this.catalogRepository.findAllCategories();
    // In a real scenario, we might want to map to DTOs or include services
    return categories;
  }
}

import { Category, Service } from '../core/catalog.entity';

export interface CatalogRepositoryPort {
  findAllCategories(): Promise<Category[]>;
  findServicesByCategoryId(categoryId: string): Promise<Service[]>;
  findServiceById(id: string): Promise<Service | null>;
}

export const CATALOG_REPOSITORY_PORT = Symbol('CatalogRepositoryPort');

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared-kernel/database/prisma.service';
import { Category, Service, UnitType } from '../core/catalog.entity';
import { CatalogRepositoryPort } from '../ports/catalog-repository.port';

@Injectable()
export class PrismaCatalogRepository implements CatalogRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findAllCategories(): Promise<Category[]> {
    const raws = await this.prisma.category.findMany();
    return raws.map(
      (raw) =>
        new Category(
          raw.id,
          raw.name,
          raw.slug,
          raw.description || undefined,
          raw.iconUrl || undefined,
        ),
    );
  }

  async findServicesByCategoryId(categoryId: string): Promise<Service[]> {
    const raws = await this.prisma.service.findMany({
      where: { categoryId },
    });
    return raws.map(
      (raw) =>
        new Service(
          raw.id,
          raw.categoryId,
          raw.name,
          raw.description || undefined,
          Number(raw.basePrice),
          raw.unitType as UnitType,
        ),
    );
  }

  async findServiceById(id: string): Promise<Service | null> {
    const raw = await this.prisma.service.findUnique({
      where: { id },
    });
    if (!raw) return null;
    return new Service(
      raw.id,
      raw.categoryId,
      raw.name,
      raw.description || undefined,
      Number(raw.basePrice),
      raw.unitType as UnitType,
    );
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared-kernel/database/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(cityId?: string) {
    const where = cityId ? { activeCities: { some: { id: cityId } } } : {};
    return this.prisma.category.findMany({
      where,
      include: { services: true },
    });
  }

  async findServicesByCategory(categoryId: string) {
    return this.prisma.service.findMany({
      where: { categoryId },
    });
  }
}

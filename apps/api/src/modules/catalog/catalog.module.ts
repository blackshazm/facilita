import { Module } from '@nestjs/common';
import { CatalogController } from './interface/catalog.controller';
import { PrismaService } from '../../shared-kernel/database/prisma.service';
import { CATALOG_REPOSITORY_PORT } from './ports/catalog-repository.port';
import { PrismaCatalogRepository } from './adapters/prisma-catalog-repository.adapter';
import { GetCatalogUseCase } from './application/get-catalog.usecase';
import { CategoryService } from './application/category.service';

@Module({
  controllers: [CatalogController],
  providers: [
    PrismaService,
    GetCatalogUseCase,
    CategoryService,
    {
      provide: CATALOG_REPOSITORY_PORT,
      useClass: PrismaCatalogRepository,
    },
  ],
  exports: [CATALOG_REPOSITORY_PORT, GetCatalogUseCase, CategoryService],
})
export class CatalogModule {}

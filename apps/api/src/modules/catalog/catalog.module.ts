import { Module } from '@nestjs/common';
import { CatalogController } from './interface/catalog.controller';
import { PrismaService } from '../../shared-kernel/database/prisma.service';
import { CATALOG_REPOSITORY_PORT } from './ports/catalog-repository.port';
import { PrismaCatalogRepository } from './adapters/prisma-catalog-repository.adapter';
import { GetCatalogUseCase } from './application/get-catalog.usecase';

@Module({
  controllers: [CatalogController],
  providers: [
    PrismaService,
    GetCatalogUseCase,
    {
      provide: CATALOG_REPOSITORY_PORT,
      useClass: PrismaCatalogRepository,
    },
  ],
  exports: [CATALOG_REPOSITORY_PORT, GetCatalogUseCase],
})
export class CatalogModule {}

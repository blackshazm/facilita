import { Module } from '@nestjs/common';
import { CatalogController } from './interface/catalog.controller';
import { CategoryService } from './application/category.service';
import { PrismaService } from '../../shared-kernel/database/prisma.service';

@Module({
  controllers: [CatalogController],
  providers: [CategoryService, PrismaService],
  exports: [CategoryService],
})
export class CatalogModule {}

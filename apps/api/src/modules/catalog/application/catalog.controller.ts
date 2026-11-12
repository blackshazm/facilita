// PRD: 4.1 Catálogo de Serviços
import { Controller, Get, Query, Optional, Inject, Res } from '@nestjs/common';
import { Response } from 'express';
import { ListServicesUseCase } from './list-services.use-case';
import { ServiceCategory } from '../core/service.entity';
import { CatalogCacheService } from '../infrastructure/catalog-cache.service';

@Controller('catalog')
export class CatalogController {
  constructor(
    private readonly listServicesUseCase: ListServicesUseCase,
    @Optional()
    @Inject(CatalogCacheService)
    private readonly cacheService?: CatalogCacheService,
  ) {}

  @Get('services')
  async getServices(
    @Query('category') category?: ServiceCategory,
    @Res({ passthrough: true }) res?: Response,
  ) {
    // 1. Tentar ler do Cache Redis
    if (this.cacheService) {
      const cached = await this.cacheService.get<any[]>(category);
      if (cached) {
        if (res) res.setHeader('X-Cache', 'HIT');
        return cached;
      }
    }

    // 2. Cache Miss: Executar consulta ao repositório
    const services = await this.listServicesUseCase.execute(category);
    const formatted = services.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      category: s.category,
      price: s.fixedPrice,
      formattedPrice: s.formattedPrice,
      estimatedTimeMinutes: s.estimatedTimeMinutes,
      included: s.includedItems,
      excluded: s.excludedItems,
    }));

    // 3. Gravar no Cache Redis
    if (this.cacheService) {
      await this.cacheService.set(category, formatted);
      if (res) res.setHeader('X-Cache', 'MISS');
    }

    return formatted;
  }
}

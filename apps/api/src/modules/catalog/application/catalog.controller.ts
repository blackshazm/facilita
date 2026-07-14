// PRD: 4.1 Catálogo de Serviços
import { Controller, Get, Query } from '@nestjs/common';
import { ListServicesUseCase } from './list-services.use-case';
import { ServiceCategory } from '../core/service.entity';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly listServicesUseCase: ListServicesUseCase) {}

  @Get('services')
  async getServices(@Query('category') category?: ServiceCategory) {
    const services = await this.listServicesUseCase.execute(category);
    // Returning formatting specifically for the response payload
    return services.map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      category: s.category,
      price: s.fixedPrice,
      formattedPrice: s.formattedPrice,
      estimatedTimeMinutes: s.estimatedTimeMinutes,
      included: s.includedItems,
      excluded: s.excludedItems
    }));
  }
}

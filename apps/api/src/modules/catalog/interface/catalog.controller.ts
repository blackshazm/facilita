import { Controller, Get, Param, Query } from '@nestjs/common';
import { CategoryService } from '../application/category.service';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('categories')
  async getCategories(@Query('cityId') cityId?: string) {
    return this.categoryService.findAll(cityId);
  }

  @Get('categories/:id/services')
  async getServices(@Param('id') id: string) {
    return this.categoryService.findServicesByCategory(id);
  }
}

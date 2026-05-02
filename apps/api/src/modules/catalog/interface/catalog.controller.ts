import { Controller, Get, Param } from '@nestjs/common';
import { CategoryService } from '../application/category.service';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('categories')
  async getCategories() {
    return this.categoryService.findAll();
  }

  @Get('categories/:id/services')
  async getServices(@Param('id') id: string) {
    return this.categoryService.findServicesByCategory(id);
  }
}

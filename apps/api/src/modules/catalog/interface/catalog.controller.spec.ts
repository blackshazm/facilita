import { Test, TestingModule } from '@nestjs/testing';
import { CatalogController } from './catalog.controller';
import { CategoryService } from '../application/category.service';

describe('CatalogController', () => {
  let controller: CatalogController;
  let categoryService: any;

  beforeEach(async () => {
    categoryService = {
      findAll: jest.fn(),
      findServicesByCategory: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatalogController],
      providers: [
        { provide: CategoryService, useValue: categoryService },
      ],
    }).compile();

    controller = module.get<CatalogController>(CatalogController);
  });

  describe('getCategories', () => {
    it('should delegate to CategoryService with cityId', async () => {
      const mockCategories = [{ id: 'cat-1', name: 'Cleaning' }];
      categoryService.findAll.mockResolvedValue(mockCategories);

      const result = await controller.getCategories('city-1');

      expect(categoryService.findAll).toHaveBeenCalledWith('city-1');
      expect(result).toEqual(mockCategories);
    });

    it('should delegate without cityId', async () => {
      const mockCategories = [{ id: 'cat-1', name: 'Cleaning' }];
      categoryService.findAll.mockResolvedValue(mockCategories);

      const result = await controller.getCategories();

      expect(categoryService.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(mockCategories);
    });
  });

  describe('getServices', () => {
    it('should delegate to CategoryService with category id', async () => {
      const mockServices = [{ id: 'svc-1', name: 'Standard Cleaning' }];
      categoryService.findServicesByCategory.mockResolvedValue(mockServices);

      const result = await controller.getServices('cat-1');

      expect(categoryService.findServicesByCategory).toHaveBeenCalledWith('cat-1');
      expect(result).toEqual(mockServices);
    });
  });
});

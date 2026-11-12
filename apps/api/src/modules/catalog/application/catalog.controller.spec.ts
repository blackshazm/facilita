import { Test, TestingModule } from '@nestjs/testing';
import { CatalogController } from './catalog.controller';
import { ListServicesUseCase } from './list-services.use-case';
import { CatalogCacheService } from '../infrastructure/catalog-cache.service';

describe('Application CatalogController', () => {
  let controller: CatalogController;
  let listServicesUseCase: any;
  let cacheService: any;

  beforeEach(async () => {
    listServicesUseCase = { execute: jest.fn() };
    cacheService = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatalogController],
      providers: [
        { provide: ListServicesUseCase, useValue: listServicesUseCase },
        { provide: CatalogCacheService, useValue: cacheService },
      ],
    }).compile();

    controller = module.get<CatalogController>(CatalogController);
  });

  describe('getServices', () => {
    it('should format services returned from use case on cache miss and save to cache', async () => {
      const mockServices = [
        {
          id: 'svc-1',
          name: 'Clean',
          description: 'Basic clean',
          category: 'CLEANING',
          fixedPrice: 10000,
          formattedPrice: 'R$ 100,00',
          estimatedTimeMinutes: 120,
          includedItems: ['A'],
          excludedItems: ['B'],
        },
      ];
      listServicesUseCase.execute.mockResolvedValue(mockServices);

      const mockRes: any = { setHeader: jest.fn() };
      const result = await controller.getServices(undefined, mockRes);

      expect(cacheService.get).toHaveBeenCalledWith(undefined);
      expect(listServicesUseCase.execute).toHaveBeenCalledWith(undefined);
      expect(cacheService.set).toHaveBeenCalledTimes(1);
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Cache', 'MISS');
      expect(result).toEqual([
        {
          id: 'svc-1',
          name: 'Clean',
          description: 'Basic clean',
          category: 'CLEANING',
          price: 10000,
          formattedPrice: 'R$ 100,00',
          estimatedTimeMinutes: 120,
          included: ['A'],
          excluded: ['B'],
        },
      ]);
    });

    it('should return cached data immediately on cache hit without calling use case', async () => {
      const cachedData = [
        {
          id: 'svc-cached',
          name: 'Instalação de Chuveiro',
          price: 12000,
        },
      ];
      cacheService.get.mockResolvedValueOnce(cachedData);

      const mockRes: any = { setHeader: jest.fn() };
      const result = await controller.getServices(undefined, mockRes);

      expect(cacheService.get).toHaveBeenCalledWith(undefined);
      expect(listServicesUseCase.execute).not.toHaveBeenCalled();
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Cache', 'HIT');
      expect(result).toEqual(cachedData);
    });
  });
});

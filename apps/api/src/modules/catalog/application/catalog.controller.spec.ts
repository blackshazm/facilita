import { Test, TestingModule } from '@nestjs/testing';
import { CatalogController } from './catalog.controller';
import { ListServicesUseCase } from './list-services.use-case';

describe('Application CatalogController', () => {
  let controller: CatalogController;
  let listServicesUseCase: any;

  beforeEach(async () => {
    listServicesUseCase = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatalogController],
      providers: [
        { provide: ListServicesUseCase, useValue: listServicesUseCase },
      ],
    }).compile();

    controller = module.get<CatalogController>(CatalogController);
  });

  describe('getServices', () => {
    it('should format services returned from use case', async () => {
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
        }
      ];
      listServicesUseCase.execute.mockResolvedValue(mockServices);

      const result = await controller.getServices();

      expect(listServicesUseCase.execute).toHaveBeenCalledWith(undefined);
      expect(result).toEqual([{
        id: 'svc-1',
        name: 'Clean',
        description: 'Basic clean',
        category: 'CLEANING',
        price: 10000,
        formattedPrice: 'R$ 100,00',
        estimatedTimeMinutes: 120,
        included: ['A'],
        excluded: ['B']
      }]);
    });
  });
});

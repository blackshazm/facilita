import { Test, TestingModule } from '@nestjs/testing';
import { GetCatalogUseCase } from './get-catalog.usecase';
import { CATALOG_REPOSITORY_PORT } from '../ports/catalog-repository.port';

describe('GetCatalogUseCase', () => {
  let useCase: GetCatalogUseCase;
  let catalogRepo: any;

  beforeEach(async () => {
    catalogRepo = {
      findAllCategories: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCatalogUseCase,
        { provide: CATALOG_REPOSITORY_PORT, useValue: catalogRepo },
      ],
    }).compile();

    useCase = module.get<GetCatalogUseCase>(GetCatalogUseCase);
  });

  it('should return all categories from repository', async () => {
    const mockCategories = [{ id: 'cat-1', name: 'Clean' }];
    catalogRepo.findAllCategories.mockResolvedValue(mockCategories);

    const result = await useCase.execute();

    expect(catalogRepo.findAllCategories).toHaveBeenCalled();
    expect(result).toEqual(mockCategories);
  });
});

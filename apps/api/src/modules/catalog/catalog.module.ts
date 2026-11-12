// PRD: 4.1 Catálogo de Serviços
import { Module } from '@nestjs/common';
import { ListServicesUseCase } from './application/list-services.use-case';
import { CatalogController } from './application/catalog.controller';
import { CatalogCacheService } from './infrastructure/catalog-cache.service';
import { CATALOG_REPOSITORY } from './ports/catalog.repository.port';
import { ServiceItem, ServiceCategory } from './core/service.entity';

// Mocks based on PRD: 4.1 Catálogo de Serviços (Elétrica)
const mockServices = [
  new ServiceItem('1', 'Instalação de chuveiro', 'Troca/instalação de chuveiro elétrico', ServiceCategory.ELETRICA, 12000, 60, ['Mão de obra', 'teste'], ['Chuveiro', 'fiação nova', 'disjuntor']),
  new ServiceItem('2', 'Troca de torneira elétrica', 'Substituição de torneira elétrica', ServiceCategory.ELETRICA, 10000, 45, ['Mão de obra', 'vedação básica'], ['Torneira', 'fiação']),
  new ServiceItem('3', 'Instalação de ventilador de teto', 'Montagem e instalação de ventilador', ServiceCategory.ELETRICA, 15000, 90, ['Mão de obra', 'fixação'], ['Ventilador', 'suporte reforçado']),
  new ServiceItem('4', 'Troca de disjuntor', 'Substituição de disjuntor no quadro', ServiceCategory.ELETRICA, 9000, 30, ['Mão de obra', 'teste'], ['Disjuntor']),
  new ServiceItem('5', 'Instalação de lustre/luminária', 'Até 3 pontos de luz', ServiceCategory.ELETRICA, 8000, 45, ['Mão de obra'], ['Lustre', 'lâmpadas']),
  new ServiceItem('6', 'Tomada/interruptor (até 3 pontos)', 'Instalação ou troca', ServiceCategory.ELETRICA, 11000, 60, ['Mão de obra', 'teste'], ['Tomadas', 'interruptores', 'caixa de passagem']),
];

const mockCatalogRepo = {
  findAllActive: async () => mockServices.filter(s => s.isActive),
  findByCategory: async (category: ServiceCategory) => mockServices.filter(s => s.isActive && s.category === category),
  findById: async (id: string) => mockServices.find(s => s.id === id) || null,
};

@Module({
  controllers: [CatalogController],
  providers: [
    ListServicesUseCase,
    CatalogCacheService,
    { provide: CATALOG_REPOSITORY, useValue: mockCatalogRepo },
  ],
  exports: [ListServicesUseCase, CatalogCacheService],
})
export class CatalogModule {}

import { Test, TestingModule } from '@nestjs/testing';
import { ValidateEvidenceUseCase } from './validate-evidence.usecase';
import { METADATA_EXTRACTOR_PORT } from '../ports/metadata-extractor.port';
import { ORDER_REPOSITORY_PORT } from '../../orders/ports/order-repository.port';
import { EvidenceType, EvidenceStatus } from '../core/evidence.entity';
import { Order, OrderStatus } from '../../orders/core/order.entity';

describe('ValidateEvidenceUseCase', () => {
  let useCase: ValidateEvidenceUseCase;
  let metadataExtractor: any;
  let orderRepo: any;

  beforeEach(async () => {
    metadataExtractor = {
      extract: jest.fn(),
    };
    orderRepo = {
      findById: jest.fn(),
      save: jest.fn(),
      findByUserId: jest.fn(),
      calculateDistance: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValidateEvidenceUseCase,
        { provide: METADATA_EXTRACTOR_PORT, useValue: metadataExtractor },
        { provide: ORDER_REPOSITORY_PORT, useValue: orderRepo },
      ],
    }).compile();

    useCase = module.get<ValidateEvidenceUseCase>(ValidateEvidenceUseCase);
  });

  it('should validate evidence as VALIDATED when photo is within geo-fence', async () => {
    const order = new Order({
      id: 'order-1', userId: 'u1', status: OrderStatus.IN_PROGRESS,
      totalAmount: 12000, latitude: -23.5505, longitude: -46.6333,
      createdAt: new Date(), updatedAt: new Date(),
    });
    orderRepo.findById.mockResolvedValue(order);
    metadataExtractor.extract.mockResolvedValue({
      latitude: -23.5510, longitude: -46.6340, // ~100m away
    });

    const result = await useCase.execute({
      orderId: 'order-1', providerId: 'p1',
      imageBuffer: Buffer.from('img'), type: EvidenceType.PRE_SERVICE,
      imageUrl: 'https://example.com/photo.jpg',
    });

    expect(result.status).toBe(EvidenceStatus.VALIDATED);
  });

  it('should reject evidence when photo is outside geo-fence', async () => {
    const order = new Order({
      id: 'order-2', userId: 'u1', status: OrderStatus.IN_PROGRESS,
      totalAmount: 12000, latitude: -23.5505, longitude: -46.6333,
      createdAt: new Date(), updatedAt: new Date(),
    });
    orderRepo.findById.mockResolvedValue(order);
    metadataExtractor.extract.mockResolvedValue({
      latitude: -23.6500, longitude: -46.7000, // ~12km away
    });

    const result = await useCase.execute({
      orderId: 'order-2', providerId: 'p1',
      imageBuffer: Buffer.from('img'), type: EvidenceType.POST_SERVICE,
      imageUrl: 'https://example.com/photo.jpg',
    });

    expect(result.status).toBe(EvidenceStatus.REJECTED);
  });

  it('should flag evidence when metadata has no GPS coordinates', async () => {
    const order = new Order({
      id: 'order-3', userId: 'u1', status: OrderStatus.IN_PROGRESS,
      totalAmount: 12000, latitude: -23.5505, longitude: -46.6333,
      createdAt: new Date(), updatedAt: new Date(),
    });
    orderRepo.findById.mockResolvedValue(order);
    metadataExtractor.extract.mockResolvedValue({});

    const result = await useCase.execute({
      orderId: 'order-3', providerId: 'p1',
      imageBuffer: Buffer.from('img'), type: EvidenceType.PRE_SERVICE,
      imageUrl: 'https://example.com/photo.jpg',
    });

    expect(result.status).toBe(EvidenceStatus.FLAGGED);
  });

  it('should throw when order is not found', async () => {
    orderRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        orderId: 'order-invalid', providerId: 'p1',
        imageBuffer: Buffer.from('img'), type: EvidenceType.PRE_SERVICE,
        imageUrl: 'https://example.com/photo.jpg',
      }),
    ).rejects.toThrow('Order not found');
  });
});

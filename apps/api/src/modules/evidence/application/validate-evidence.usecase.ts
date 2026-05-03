import { Injectable, Inject } from '@nestjs/common';
import { METADATA_EXTRACTOR_PORT, MetadataExtractorPort } from '../ports/metadata-extractor.port';
import { Evidence, EvidenceType, EvidenceStatus } from '../core/evidence.entity';
import { ORDER_REPOSITORY_PORT, OrderRepositoryPort } from '../../orders/ports/order-repository.port';

@Injectable()
export class ValidateEvidenceUseCase {
  constructor(
    @Inject(METADATA_EXTRACTOR_PORT)
    private readonly metadataExtractor: MetadataExtractorPort,
    @Inject(ORDER_REPOSITORY_PORT)
    private readonly orderRepository: OrderRepositoryPort,
  ) {}

  async execute(params: {
    orderId: string;
    providerId: string;
    imageBuffer: Buffer;
    type: EvidenceType;
    imageUrl: string;
  }): Promise<Evidence> {
    // 1. Fetch Order to get target location
    const order = await this.orderRepository.findById(params.orderId);
    if (!order) throw new Error('Order not found');

    // 2. Extract Metadata from image
    const metadata = await this.metadataExtractor.extract(params.imageBuffer);

    // 3. Create Evidence Entity
    const evidence = new Evidence({
      id: Math.random().toString(36).substring(7), // Simple ID generator for now
      orderId: params.orderId,
      providerId: params.providerId,
      type: params.type,
      imageUrl: params.imageUrl,
      status: EvidenceStatus.PENDING,
      metadata,
      createdAt: new Date(),
    });

    // 4. Validate Location (Geo-fencing)
    const orderLocation = order.location;
    if (orderLocation) {
      evidence.validate(orderLocation);
    } else {
      // If order has no location, flag it for review
      evidence.validate({ lat: 0, lng: 0 }); // This will likely reject or flag
    }

    console.log(`[Evidence] Validation finished: ${evidence.status} for order ${params.orderId}`);
    
    return evidence;
  }
}

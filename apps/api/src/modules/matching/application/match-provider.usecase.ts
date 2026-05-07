import { Injectable, Inject } from '@nestjs/common';
import { Location } from '../core/provider-status.entity';
import { MATCHING_ENGINE_PORT, MatchingEnginePort, NearbyProvider } from '../ports/matching-engine.port';

@Injectable()
export class MatchProviderUseCase {
  constructor(
    @Inject(MATCHING_ENGINE_PORT)
    private readonly matchingEngine: MatchingEnginePort,
  ) {}

  async execute(neighborhoodId: string, categoryId: string): Promise<NearbyProvider[]> {
    console.log(`[Matching] Attempting search in neighborhood: ${neighborhoodId}`);
    
    const providers = await this.matchingEngine.findProvidersInNeighborhood(
      neighborhoodId,
      categoryId,
      5 // Limit to top 5
    );

    if (providers.length > 0) {
      console.log(`[Matching] Found ${providers.length} providers in neighborhood ${neighborhoodId}`);
      return providers;
    }

    console.warn(`[Matching] No providers found for category ${categoryId} in neighborhood ${neighborhoodId}`);
    return [];
  }
}

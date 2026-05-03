import { Injectable, Inject } from '@nestjs/common';
import { Location } from '../core/provider-status.entity';
import { MATCHING_ENGINE_PORT, MatchingEnginePort, NearbyProvider } from '../ports/matching-engine.port';

@Injectable()
export class MatchProviderUseCase {
  private readonly RADII = [1000, 5000, 10000]; // Meters (1km, 5km, 10km)

  constructor(
    @Inject(MATCHING_ENGINE_PORT)
    private readonly matchingEngine: MatchingEnginePort,
  ) {}

  async execute(location: Location, categoryId: string): Promise<NearbyProvider[]> {
    for (const radius of this.RADII) {
      console.log(`[Matching] Attempting search with radius: ${radius}m`);
      
      const providers = await this.matchingEngine.findNearbyProviders(
        location,
        categoryId,
        radius,
        5 // Limit to top 5 closest
      );

      if (providers.length > 0) {
        console.log(`[Matching] Found ${providers.length} providers within ${radius}m`);
        return providers;
      }
    }

    console.warn(`[Matching] No providers found for category ${categoryId} within 10km`);
    return [];
  }
}

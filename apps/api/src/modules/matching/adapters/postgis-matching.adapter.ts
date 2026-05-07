import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared-kernel/database/prisma.service';
import { Location } from '../core/provider-status.entity';
import { MatchingEnginePort, NearbyProvider } from '../ports/matching-engine.port';

@Injectable()
export class PostgisMatchingAdapter implements MatchingEnginePort {
  constructor(private readonly prisma: PrismaService) {}

  async findProvidersInNeighborhood(
    neighborhoodId: string,
    categoryId: string,
    limit: number = 10
  ): Promise<NearbyProvider[]> {
    // Array intersection query to find providers who have this neighborhood in their service zones
    const providers = await this.prisma.activeProvider.findMany({
      where: {
        categoryId,
        isOnline: true,
        // Since activeProvider doesn't hold the zones, we need to query through the ProviderProfile
        providerId: {
          in: (
            await this.prisma.providerProfile.findMany({
              where: {
                serviceZones: {
                  some: {
                    id: neighborhoodId
                  }
                }
              },
              select: { id: true } // ProviderProfile id is the providerId
            })
          ).map(p => p.id)
        }
      },
      take: limit
    });

    // We no longer have distance in a strict sense, so we return distance 0 or we can remove it later.
    return providers.map(p => ({
      providerId: p.providerId,
      distance: 0 
    }));
  }
}

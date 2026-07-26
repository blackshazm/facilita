import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared-kernel/database/prisma.service';
import { MatchingEnginePort, NearbyProvider } from '../ports/matching-engine.port';

@Injectable()
export class PostgisMatchingAdapter implements MatchingEnginePort {
  constructor(private readonly prisma: PrismaService) {}

  async findProvidersInRadius(
    latitude: number,
    longitude: number,
    radiusMeters: number,
    categoryId: string,
    tier: string,
    limit: number = 10
  ): Promise<NearbyProvider[]> {
    // PostGIS raw query to find online providers within radius, filtered by category and tier
    // We join ProviderLocation (matching), ActiveProvider (matching), and ProviderProfile (identity)
    
    const result = await this.prisma.$queryRaw`
      SELECT 
        ap."providerId", 
        ST_DistanceSphere(pl.location, ST_MakePoint(${longitude}, ${latitude})) as distance
      FROM matching."ActiveProvider" ap
      JOIN matching."ProviderLocation" pl ON ap."providerId" = pl."providerId"
      JOIN identity."ProviderProfile" pp ON ap."providerId" = pp."userId"
      WHERE ap."categoryId" = ${categoryId}
        AND ap."isOnline" = true
        AND pp."tier"::text = ${tier}
        AND ST_DWithin(
          pl.location, 
          ST_MakePoint(${longitude}, ${latitude})::geography, 
          ${radiusMeters}
        )
      ORDER BY distance ASC
      LIMIT ${limit}
    `;

    // Map raw result to interface
    const rows = result as Array<{ providerId: string; distance: number }>;
    return rows.map(r => ({
      providerId: r.providerId,
      distance: r.distance
    }));
  }
}

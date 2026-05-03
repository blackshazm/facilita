import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared-kernel/database/prisma.service';
import { Location } from '../core/provider-status.entity';
import { MatchingEnginePort, NearbyProvider } from '../ports/matching-engine.port';

@Injectable()
export class PostgisMatchingAdapter implements MatchingEnginePort {
  constructor(private readonly prisma: PrismaService) {}

  async findNearbyProviders(
    location: Location,
    categoryId: string,
    radiusInMeters: number,
    limit: number = 10
  ): Promise<NearbyProvider[]> {
    // Note: Using Raw SQL for PostGIS performance and spatial functions
    const query = `
      SELECT 
        ap."providerId",
        ST_Distance(pl.location, ST_SetSRID(ST_MakePoint($1, $2), 4326)) as distance
      FROM "matching"."ActiveProvider" ap
      JOIN "matching"."ProviderLocation" pl ON ap."providerId" = pl."providerId"
      WHERE ap."categoryId" = $3
        AND ap."isOnline" = true
        AND ST_DWithin(
          pl.location, 
          ST_SetSRID(ST_MakePoint($1, $2), 4326), 
          $4
        )
      ORDER BY distance ASC
      LIMIT $5
    `;

    const results = await this.prisma.$queryRawUnsafe<any[]>(
      query,
      location.longitude,
      location.latitude,
      categoryId,
      radiusInMeters,
      limit
    );

    return results.map(r => ({
      providerId: r.providerId,
      distance: Number(r.distance)
    }));
  }
}

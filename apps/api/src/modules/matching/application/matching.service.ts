import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared-kernel/database/prisma.service';

@Injectable()
export class MatchingService {
  constructor(private readonly prisma: PrismaService) {}

  async updateLocation(providerId: string, lat: number, lng: number) {
    // PostGIS Point creation via raw SQL
    return this.prisma.$executeRawUnsafe(
      `INSERT INTO "matching"."ProviderLocation" ("id", "providerId", "location", "updatedAt")
       VALUES (gen_random_uuid(), $1, ST_SetSRID(ST_MakePoint($2, $3), 4326), NOW())
       ON CONFLICT ("providerId") DO UPDATE 
       SET "location" = ST_SetSRID(ST_MakePoint($2, $3), 4326), "updatedAt" = NOW()`,
      providerId,
      lng, // Longitude comes first in PostGIS ST_MakePoint
      lat
    );
  }

  async findNearbyProviders(lat: number, lng: number, categoryId: string, radiusKm: number = 10) {
    const radiusMeters = radiusKm * 1000;

    // Spatial join between ProviderLocation and ActiveProvider
    return this.prisma.$queryRawUnsafe(
      `SELECT pl."providerId", 
              ST_Distance(pl.location, ST_SetSRID(ST_MakePoint($1, $2), 4326)) as distance
       FROM "matching"."ProviderLocation" pl
       JOIN "matching"."ActiveProvider" ap ON pl."providerId" = ap."providerId"
       WHERE ap."isOnline" = true 
         AND ap."categoryId" = $3
         AND ST_DWithin(pl.location, ST_SetSRID(ST_MakePoint($1, $2), 4326), $4)
       ORDER BY distance ASC`,
      lng,
      lat,
      categoryId,
      radiusMeters
    );
  }
}

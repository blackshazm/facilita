import { PrismaClient } from '@prisma/client';
import { Professional, ProfessionalStatus } from '../../domain/entities/professional.entity';
import { Location } from '../../domain/entities/location.vo';
import { ProfessionalRepositoryPort } from '../../ports/out/professional.repository.port';

export class PrismaProfessionalRepository implements ProfessionalRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async findAvailableNearby(category: string, location: Location, radiusInMeters: number): Promise<Professional[]> {
    // Utilizando ST_DWithin do PostGIS via consulta RAW para busca em raio
    // Assumimos que o banco tem a extensão postgis ativada e a coluna geom preenchida
    
    const professionalsRaw = await this.prisma.$queryRaw<any[]>`
      SELECT id, status, category, latitude, longitude
      FROM professionals
      WHERE status = 'ONLINE'
        AND category = ${category}
        AND ST_DWithin(
          geom, 
          ST_MakePoint(${location.longitude}, ${location.latitude})::geography, 
          ${radiusInMeters}
        );
    `;

    return professionalsRaw.map(
      (raw) =>
        new Professional(
          raw.id,
          raw.status as ProfessionalStatus,
          raw.category,
          new Location(raw.latitude, raw.longitude),
        )
    );
  }
}

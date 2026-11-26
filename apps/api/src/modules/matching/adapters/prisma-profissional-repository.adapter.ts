import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared-kernel/database/prisma.service';
import { 
  ProfissionalRepositoryPort, 
  Profissional, 
  Localizacao, 
  CategoriaProfissional, 
  StatusProfissional 
} from '../core/ports/outbound/profissional.repository.port';

@Injectable()
export class PrismaProfissionalRepositoryAdapter implements ProfissionalRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async buscarProfissionaisDisponiveisPorLocalizacaoEServico(
    localizacaoCliente: Localizacao,
    raioKm: number,
    categoria: CategoriaProfissional,
  ): Promise<Profissional[]> {
    const { latitude, longitude } = localizacaoCliente;
    
    // Cálculo de Haversine via query puramente otimizada para buscar por raio
    // Fórmula de Haversine (raio da Terra = 6371 km)
    const result = await this.prisma.$queryRaw<
      Array<{
        id: string;
        nome: string;
        categoria: string;
        status: string;
        lat: number;
        lng: number;
        distancia_km: number;
      }>
    >`
      SELECT 
        p.id, 
        p.nome, 
        p.categoria, 
        p.status,
        pl.latitude as lat,
        pl.longitude as lng,
        (
          6371 * acos(
            cos(radians(${latitude})) * 
            cos(radians(pl.latitude)) * 
            cos(radians(pl.longitude) - radians(${longitude})) + 
            sin(radians(${latitude})) * 
            sin(radians(pl.latitude))
          )
        ) AS distancia_km
      FROM "Profissionais" p
      JOIN "ProfissionalLocalizacao" pl ON p.id = pl."profissionalId"
      WHERE p.status = 'ONLINE'
        AND p.categoria = ${categoria}
        AND (
          6371 * acos(
            cos(radians(${latitude})) * 
            cos(radians(pl.latitude)) * 
            cos(radians(pl.longitude) - radians(${longitude})) + 
            sin(radians(${latitude})) * 
            sin(radians(pl.latitude))
          )
        ) <= ${raioKm}
      ORDER BY distancia_km ASC
      LIMIT 50
    `;

    return result.map(
      (row) =>
        new Profissional(
          row.id,
          row.nome,
          row.categoria as CategoriaProfissional,
          row.status as StatusProfissional,
          { latitude: row.lat, longitude: row.lng }
        )
    );
  }
}

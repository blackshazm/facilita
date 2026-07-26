import { Location } from '../core/provider-status.entity';

export interface NearbyProvider {
  providerId: string;
  distance: number;
}

export interface MatchingEnginePort {
  findProvidersInRadius(
    latitude: number,
    longitude: number,
    radiusMeters: number,
    categoryId: string,
    tier: string,
    limit?: number
  ): Promise<NearbyProvider[]>;
}

export const MATCHING_ENGINE_PORT = Symbol('MatchingEnginePort');

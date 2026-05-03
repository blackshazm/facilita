import { Location } from '../core/provider-status.entity';

export interface NearbyProvider {
  providerId: string;
  distance: number;
}

export interface MatchingEnginePort {
  findNearbyProviders(
    location: Location,
    categoryId: string,
    radiusInMeters: number,
    limit?: number
  ): Promise<NearbyProvider[]>;
}

export const MATCHING_ENGINE_PORT = Symbol('MatchingEnginePort');

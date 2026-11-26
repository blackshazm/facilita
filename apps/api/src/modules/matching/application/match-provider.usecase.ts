import { Injectable, Inject, Logger } from '@nestjs/common';
import { MATCHING_ENGINE_PORT, MatchingEnginePort, NearbyProvider } from '../ports/matching-engine.port';
import { MatchingGateway } from '../adapters/matching.gateway';

export interface DispatchRequest {
  orderId: string;
  latitude: number;
  longitude: number;
  categoryId: string;
  radiusMeters?: number;
  requiresNr10?: boolean; // Resolução v4.1 (#42 & #96): Gate de segurança elétrica NR-10
}

@Injectable()
export class MatchProviderUseCase {
  private readonly logger = new Logger(MatchProviderUseCase.name);

  // Tiers in order of priority
  private readonly TIERS = ['OURO', 'PRATA', 'BRONZE'];

  constructor(
    @Inject(MATCHING_ENGINE_PORT)
    private readonly matchingEngine: MatchingEnginePort,
    private readonly gateway: MatchingGateway,
  ) {}

  /**
   * Dispatches the job in waves (Ouro -> Prata -> Bronze)
   * In a production async architecture, each wave would be separated by a BullMQ delayed job.
   * Here we do an immediate fallback if the higher tier has no online providers nearby.
   */
  async execute(request: DispatchRequest): Promise<NearbyProvider[]> {
    const radius = request.radiusMeters || 5000; // default 5km

    this.logger.log(`[Smart Dispatch] Order ${request.orderId} at ${request.latitude},${request.longitude}`);
    
    for (const tier of this.TIERS) {
      this.logger.log(`[Wave] Searching for ${tier} providers...`);
      
      const providers = request.requiresNr10 !== undefined
        ? await this.matchingEngine.findProvidersInRadius(
            request.latitude,
            request.longitude,
            radius,
            request.categoryId,
            tier,
            5, // dispatch to top 5 closest
            request.requiresNr10,
          )
        : await this.matchingEngine.findProvidersInRadius(
            request.latitude,
            request.longitude,
            radius,
            request.categoryId,
            tier,
            5, // dispatch to top 5 closest
          );

      if (providers.length > 0) {
        this.logger.log(`[Wave] Found ${providers.length} ${tier} providers. Dispatching!`);
        
        // Dispatch to all found providers via WebSocket
        let dispatchedCount = 0;
        for (const p of providers) {
          const success = this.gateway.dispatchToProvider(p.providerId, {
            orderId: request.orderId,
            distance: p.distance,
            tier: tier
          });
          if (success) dispatchedCount++;
        }

        this.logger.log(`[Wave] Successfully dispatched to ${dispatchedCount} active WebSocket clients.`);
        return providers;
      }
    }

    this.logger.warn(`[Smart Dispatch] Exhausted all waves. No online providers found within ${radius}m.`);
    return [];
  }
}

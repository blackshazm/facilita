import { MatchProviderUseCase, DispatchRequest } from './match-provider.usecase';
import { MATCHING_ENGINE_PORT } from '../ports/matching-engine.port';

describe('MatchProviderUseCase', () => {
  let useCase: MatchProviderUseCase;
  let matchingEngine: any;
  let gateway: any;

  const baseRequest: DispatchRequest = {
    orderId: 'order-1',
    latitude: -23.55,
    longitude: -46.63,
    categoryId: 'cat-eletrica',
  };

  beforeEach(() => {
    matchingEngine = {
      findProvidersInRadius: jest.fn(),
    };
    gateway = {
      dispatchToProvider: jest.fn().mockReturnValue(true),
    };

    useCase = new MatchProviderUseCase(matchingEngine, gateway);
  });

  it('should search OURO tier first', async () => {
    matchingEngine.findProvidersInRadius.mockResolvedValue([
      { providerId: 'p-ouro', distance: 500 },
    ]);

    await useCase.execute(baseRequest);

    expect(matchingEngine.findProvidersInRadius).toHaveBeenCalledWith(
      -23.55, -46.63, 5000, 'cat-eletrica', 'OURO', 5,
    );
  });

  it('should fallback to PRATA when OURO returns empty', async () => {
    matchingEngine.findProvidersInRadius
      .mockResolvedValueOnce([]) // OURO - empty
      .mockResolvedValueOnce([{ providerId: 'p-prata', distance: 1000 }]); // PRATA

    const result = await useCase.execute(baseRequest);

    expect(matchingEngine.findProvidersInRadius).toHaveBeenCalledTimes(2);
    expect(result).toHaveLength(1);
    expect(result[0].providerId).toBe('p-prata');
  });

  it('should fallback to BRONZE when OURO and PRATA return empty', async () => {
    matchingEngine.findProvidersInRadius
      .mockResolvedValueOnce([]) // OURO
      .mockResolvedValueOnce([]) // PRATA
      .mockResolvedValueOnce([{ providerId: 'p-bronze', distance: 2000 }]);

    const result = await useCase.execute(baseRequest);

    expect(matchingEngine.findProvidersInRadius).toHaveBeenCalledTimes(3);
    expect(result[0].providerId).toBe('p-bronze');
  });

  it('should return empty array when no providers found in any tier', async () => {
    matchingEngine.findProvidersInRadius.mockResolvedValue([]);

    const result = await useCase.execute(baseRequest);

    expect(matchingEngine.findProvidersInRadius).toHaveBeenCalledTimes(3);
    expect(result).toEqual([]);
  });

  it('should dispatch to providers via WebSocket gateway', async () => {
    matchingEngine.findProvidersInRadius.mockResolvedValue([
      { providerId: 'p1', distance: 500 },
      { providerId: 'p2', distance: 800 },
    ]);

    await useCase.execute(baseRequest);

    expect(gateway.dispatchToProvider).toHaveBeenCalledTimes(2);
    expect(gateway.dispatchToProvider).toHaveBeenCalledWith('p1', expect.objectContaining({
      orderId: 'order-1',
      distance: 500,
      tier: 'OURO',
    }));
  });

  it('should use default radius of 5000m', async () => {
    matchingEngine.findProvidersInRadius.mockResolvedValue([]);

    await useCase.execute(baseRequest);

    expect(matchingEngine.findProvidersInRadius).toHaveBeenCalledWith(
      expect.any(Number), expect.any(Number), 5000, expect.any(String), expect.any(String), 5,
    );
  });

  it('should respect custom radius', async () => {
    matchingEngine.findProvidersInRadius.mockResolvedValue([]);

    await useCase.execute({ ...baseRequest, radiusMeters: 10000 });

    expect(matchingEngine.findProvidersInRadius).toHaveBeenCalledWith(
      expect.any(Number), expect.any(Number), 10000, expect.any(String), expect.any(String), 5,
    );
  });
});

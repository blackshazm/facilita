import { ProviderStatus, Location } from './provider-status.entity';

describe('ProviderStatus Entity', () => {
  const makeProviderStatus = (overrides?: Partial<{
    isOnline: boolean;
    location: Location;
  }>): ProviderStatus => {
    return new ProviderStatus({
      providerId: 'provider-1',
      categoryId: 'cat-eletrica',
      isOnline: overrides?.isOnline ?? false,
      location: overrides?.location,
      updatedAt: new Date('2025-01-01'),
    });
  };

  describe('goOnline()', () => {
    it('should set isOnline to true and update location', () => {
      const provider = makeProviderStatus({ isOnline: false });
      const location: Location = { latitude: -23.55, longitude: -46.63 };
      provider.goOnline(location);

      expect(provider.isOnline).toBe(true);
      expect(provider.location).toEqual(location);
    });
  });

  describe('goOffline()', () => {
    it('should set isOnline to false', () => {
      const location: Location = { latitude: -23.55, longitude: -46.63 };
      const provider = makeProviderStatus({ isOnline: true, location });
      provider.goOffline();

      expect(provider.isOnline).toBe(false);
    });
  });

  describe('getters', () => {
    it('should return providerId', () => {
      const provider = makeProviderStatus();
      expect(provider.providerId).toBe('provider-1');
    });

    it('should return categoryId', () => {
      const provider = makeProviderStatus();
      expect(provider.categoryId).toBe('cat-eletrica');
    });

    it('should return undefined location when not set', () => {
      const provider = makeProviderStatus();
      expect(provider.location).toBeUndefined();
    });
  });

  describe('toJSON()', () => {
    it('should return a complete snapshot', () => {
      const provider = makeProviderStatus({ isOnline: true, location: { latitude: -23.55, longitude: -46.63 } });
      const json = provider.toJSON();
      expect(json).toEqual(expect.objectContaining({
        providerId: 'provider-1',
        categoryId: 'cat-eletrica',
        isOnline: true,
      }));
    });
  });
});

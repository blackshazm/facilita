import { Evidence, EvidenceType, EvidenceStatus } from './evidence.entity';

describe('Evidence Entity', () => {
  const makeEvidence = (overrides?: Partial<{
    latitude: number;
    longitude: number;
  }>): Evidence => {
    return new Evidence({
      id: 'ev-1',
      orderId: 'order-1',
      providerId: 'provider-1',
      type: EvidenceType.PRE_SERVICE,
      imageUrl: 'https://storage.example.com/photo.jpg',
      status: EvidenceStatus.PENDING,
      metadata: {
        latitude: overrides?.latitude,
        longitude: overrides?.longitude,
        capturedAt: new Date('2025-06-15T10:00:00Z'),
        deviceInfo: 'iPhone 15',
      },
      createdAt: new Date('2025-06-15'),
    });
  };

  describe('validate()', () => {
    it('should set status to VALIDATED when within 500m of order location', () => {
      // Same location = 0m distance
      const evidence = makeEvidence({ latitude: -23.5505, longitude: -46.6333 });
      evidence.validate({ lat: -23.5505, lng: -46.6333 });
      expect(evidence.status).toBe(EvidenceStatus.VALIDATED);
    });

    it('should set status to VALIDATED when slightly within 500m', () => {
      // ~200m apart in São Paulo
      const evidence = makeEvidence({ latitude: -23.5505, longitude: -46.6333 });
      evidence.validate({ lat: -23.5520, lng: -46.6333 });
      expect(evidence.status).toBe(EvidenceStatus.VALIDATED);
    });

    it('should set status to REJECTED when over 500m from order location', () => {
      // ~11km apart
      const evidence = makeEvidence({ latitude: -23.5505, longitude: -46.6333 });
      evidence.validate({ lat: -23.6500, lng: -46.6333 });
      expect(evidence.status).toBe(EvidenceStatus.REJECTED);
    });

    it('should set status to FLAGGED when metadata has no latitude', () => {
      const evidence = makeEvidence({ longitude: -46.6333 });
      evidence.validate({ lat: -23.5505, lng: -46.6333 });
      expect(evidence.status).toBe(EvidenceStatus.FLAGGED);
    });

    it('should set status to FLAGGED when metadata has no longitude', () => {
      const evidence = makeEvidence({ latitude: -23.5505 });
      evidence.validate({ lat: -23.5505, lng: -46.6333 });
      expect(evidence.status).toBe(EvidenceStatus.FLAGGED);
    });

    it('should set status to FLAGGED when metadata has no coordinates at all', () => {
      const evidence = makeEvidence({});
      evidence.validate({ lat: -23.5505, lng: -46.6333 });
      expect(evidence.status).toBe(EvidenceStatus.FLAGGED);
    });
  });

  describe('toJSON()', () => {
    it('should return a complete snapshot', () => {
      const evidence = makeEvidence({ latitude: -23.55, longitude: -46.63 });
      const json = evidence.toJSON();
      expect(json).toEqual(expect.objectContaining({
        id: 'ev-1',
        orderId: 'order-1',
        providerId: 'provider-1',
        type: EvidenceType.PRE_SERVICE,
        status: EvidenceStatus.PENDING,
      }));
    });
  });
});

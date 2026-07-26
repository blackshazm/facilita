import { Test, TestingModule } from '@nestjs/testing';
import { ProviderController } from './provider.controller';
import { PROVIDER_REPOSITORY_PORT } from '../ports/provider-repository.port';
import { RolesGuard } from './guards/roles.guard';
import { Reflector } from '@nestjs/core';

describe('ProviderController', () => {
  let controller: ProviderController;
  let providerRepo: any;

  beforeEach(async () => {
    providerRepo = {
      findById: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProviderController],
      providers: [
        { provide: PROVIDER_REPOSITORY_PORT, useValue: providerRepo },
        RolesGuard,
        Reflector,
      ],
    }).compile();

    controller = module.get<ProviderController>(ProviderController);
  });

  describe('updateServiceZones', () => {
    it('should update service zones for a valid provider', async () => {
      const mockProvider = { id: 'provider-1', serviceZoneIds: [] };
      providerRepo.findById.mockResolvedValue(mockProvider);
      
      const req = { user: { profileId: 'provider-1' } };
      const body = { serviceZoneIds: ['zone-a', 'zone-b'] };

      const result = await controller.updateServiceZones(req, body);

      expect(providerRepo.findById).toHaveBeenCalledWith('provider-1');
      expect(mockProvider.serviceZoneIds).toEqual(['zone-a', 'zone-b']);
      expect(providerRepo.save).toHaveBeenCalledWith(mockProvider);
      expect(result).toEqual({
        message: 'Service zones updated successfully',
        serviceZoneIds: ['zone-a', 'zone-b'],
      });
    });

    it('should throw error if providerId is missing in context', async () => {
      const req = { user: {} };
      const body = { serviceZoneIds: ['zone-a'] };

      await expect(controller.updateServiceZones(req, body)).rejects.toThrow('Provider Profile ID not found in context');
    });

    it('should throw error if provider is not found', async () => {
      providerRepo.findById.mockResolvedValue(null);
      const req = { user: { profileId: 'provider-invalid' } };
      const body = { serviceZoneIds: ['zone-a'] };

      await expect(controller.updateServiceZones(req, body)).rejects.toThrow('Provider not found');
    });
  });
});

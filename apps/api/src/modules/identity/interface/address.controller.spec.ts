import { Test, TestingModule } from '@nestjs/testing';
import { AddressController, UserAddressDto } from './address.controller';
import { BadRequestException } from '@nestjs/common';

describe('AddressController', () => {
  let controller: AddressController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AddressController],
    }).compile();

    controller = module.get<AddressController>(AddressController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAddresses', () => {
    it('should return initial addresses for user', async () => {
      const addresses = await controller.getAddresses({ user: { id: 'test-user' } });
      expect(Array.isArray(addresses)).toBe(true);
      expect(addresses.length).toBeGreaterThan(0);
      expect(addresses[0].street).toBe('Av. Paulista');
    });
  });

  describe('saveAddress', () => {
    it('should throw BadRequestException when complement is missing or empty string', async () => {
      const invalidDto: any = {
        label: 'CASA',
        street: 'Rua Augusta',
        number: '1500',
        neighborhood: 'Consolação',
        city: 'São Paulo',
        state: 'SP',
        cep: '01305-100',
        complement: '   ',
      };

      await expect(
        controller.saveAddress({ user: { id: 'test-user' } }, invalidDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should save a new address and prepend it to list when complement is provided', async () => {
      const validDto: UserAddressDto = {
        label: 'CASA',
        street: 'Rua Augusta',
        number: '1500',
        complement: 'Apto 101 Bloco B',
        neighborhood: 'Consolação',
        city: 'São Paulo',
        state: 'SP',
        cep: '01305-100',
        isDefault: true,
      };

      const saved = await controller.saveAddress({ user: { id: 'test-user' } }, validDto);
      expect(saved.id).toBeDefined();
      expect(saved.street).toBe('Rua Augusta');
      expect(saved.complement).toBe('Apto 101 Bloco B');
      expect(saved.isDefault).toBe(true);

      const list = await controller.getAddresses({ user: { id: 'test-user' } });
      expect(list[0].street).toBe('Rua Augusta');
      expect(list[0].complement).toBe('Apto 101 Bloco B');
    });
  });

  describe('deleteAddress', () => {
    it('should remove an address by id', async () => {
      const res = await controller.deleteAddress({ user: { id: 'test-user' } }, 'addr-1');
      expect(res.success).toBe(true);
      expect(res.deletedId).toBe('addr-1');
    });
  });
});

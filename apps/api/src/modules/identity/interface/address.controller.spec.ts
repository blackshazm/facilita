import { Test, TestingModule } from '@nestjs/testing';
import { AddressController, UserAddressDto } from './address.controller';

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
    it('should save a new address and prepend it to list', async () => {
      const newDto: UserAddressDto = {
        label: 'CASA',
        street: 'Rua Augusta',
        number: '1500',
        neighborhood: 'Consolação',
        city: 'São Paulo',
        state: 'SP',
        cep: '01305-100',
        isDefault: true,
      };

      const saved = await controller.saveAddress({ user: { id: 'test-user' } }, newDto);
      expect(saved.id).toBeDefined();
      expect(saved.street).toBe('Rua Augusta');
      expect(saved.isDefault).toBe(true);

      const list = await controller.getAddresses({ user: { id: 'test-user' } });
      expect(list[0].street).toBe('Rua Augusta');
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

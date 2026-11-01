import { Controller, Get, Post, Delete, Body, Param, Request, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';

export interface UserAddressDto {
  id?: string;
  label: 'CASA' | 'TRABALHO' | 'OUTRO';
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
  isDefault?: boolean;
}

// In-memory fallback para ambiente de desenvolvimento/homologação
const USER_ADDRESSES_STORE = new Map<string, UserAddressDto[]>([
  [
    'default',
    [
      {
        id: 'addr-1',
        label: 'CASA',
        street: 'Av. Paulista',
        number: '1000',
        complement: 'Apto 42',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        cep: '01310-100',
        isDefault: true,
      },
      {
        id: 'addr-2',
        label: 'TRABALHO',
        street: 'Rua Funchal',
        number: '418',
        complement: '10º Andar',
        neighborhood: 'Vila Olímpia',
        city: 'São Paulo',
        state: 'SP',
        cep: '04551-060',
        isDefault: false,
      },
    ],
  ],
]);

@Controller('identity/addresses')
export class AddressController {
  @Get()
  async getAddresses(@Request() req: any) {
    const userId = req.user?.id || 'default';
    const list = USER_ADDRESSES_STORE.get(userId) || USER_ADDRESSES_STORE.get('default') || [];
    return list;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async saveAddress(@Request() req: any, @Body() dto: UserAddressDto) {
    const userId = req.user?.id || 'default';
    const current = USER_ADDRESSES_STORE.get(userId) || [
      ...(USER_ADDRESSES_STORE.get('default') || []),
    ];

    const newAddress: UserAddressDto = {
      ...dto,
      id: dto.id || `addr-${Date.now()}`,
      isDefault: dto.isDefault || current.length === 0,
    };

    if (newAddress.isDefault) {
      current.forEach(a => (a.isDefault = false));
    }

    current.unshift(newAddress);
    USER_ADDRESSES_STORE.set(userId, current);

    return newAddress;
  }

  @Delete(':id')
  async deleteAddress(@Request() req: any, @Param('id') id: string) {
    const userId = req.user?.id || 'default';
    const current = USER_ADDRESSES_STORE.get(userId) || [
      ...(USER_ADDRESSES_STORE.get('default') || []),
    ];

    const updated = current.filter(a => a.id !== id);
    USER_ADDRESSES_STORE.set(userId, updated);

    return { success: true, deletedId: id };
  }
}

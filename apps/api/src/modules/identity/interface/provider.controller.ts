import { Controller, Put, Body, UseGuards, Req } from '@nestjs/common';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from '../core/user.entity';
import { PROVIDER_REPOSITORY_PORT, ProviderRepositoryPort } from '../ports/provider-repository.port';
import { Inject } from '@nestjs/common';

@Controller('provider')
export class ProviderController {
  constructor(
    @Inject(PROVIDER_REPOSITORY_PORT)
    private readonly providerRepository: ProviderRepositoryPort,
  ) {}

  @Put('service-zones')
  @Roles(UserRole.PROVIDER)
  @UseGuards(RolesGuard)
  async updateServiceZones(@Req() req: any, @Body() body: { serviceZoneIds: string[] }) {
    // In a real scenario, extract providerId from the authenticated user token (req.user)
    // For this implementation, we assume req.user.profileId is available or we use a body parameter
    const providerId = req.user?.profileId || body['providerId']; // fallback for testing

    if (!providerId) {
      throw new Error('Provider Profile ID not found in context');
    }

    const provider = await this.providerRepository.findById(providerId);
    if (!provider) {
      throw new Error('Provider not found');
    }

    provider.serviceZoneIds = body.serviceZoneIds;
    await this.providerRepository.save(provider);

    return { message: 'Service zones updated successfully', serviceZoneIds: provider.serviceZoneIds };
  }
}

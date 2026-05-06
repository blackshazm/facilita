import { Body, Controller, Get, Inject, Put, UseGuards } from '@nestjs/common';
import { PROVIDER_REPOSITORY_PORT, ProviderRepositoryPort } from '../../../identity/ports/provider-repository.port';
import { SecurityService } from '../../../../shared-kernel/services/security.service';
import { JwtAuthGuard } from '../../../../shared-kernel/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../shared-kernel/decorators/current-user.decorator';

@Controller('payments/bank-data')
@UseGuards(JwtAuthGuard)
export class BankDataController {
  constructor(
    @Inject(PROVIDER_REPOSITORY_PORT)
    private readonly providerRepository: ProviderRepositoryPort,
    private readonly securityService: SecurityService,
  ) {}

  @Get()
  async getBankData(@CurrentUser() user: any) {
    const provider = await this.providerRepository.findById(user.id);
    if (!provider) return { message: 'Provider not found' };

    return {
      bankCode: provider.bankCode,
      bankBranch: provider.bankBranch,
      bankBranchDigit: provider.bankBranchDigit,
      bankAccount: provider.bankAccount ? '****' + this.securityService.decrypt(provider.bankAccount).slice(-4) : null,
      bankAccountDigit: provider.bankAccountDigit,
      bankAccountType: provider.bankAccountType,
      bankDataUpdatedAt: provider.bankDataUpdatedAt,
    };
  }

  @Put()
  async updateBankData(@CurrentUser() user: any, @Body() data: any) {
    const provider = await this.providerRepository.findById(user.id);
    if (!provider) return { message: 'Provider not found' };

    // Encrypt sensitive fields
    provider.bankCode = data.bankCode;
    provider.bankBranch = data.bankBranch;
    provider.bankBranchDigit = data.bankBranchDigit;
    provider.bankAccount = this.securityService.encrypt(data.bankAccount);
    provider.bankAccountDigit = data.bankAccountDigit;
    provider.bankAccountType = data.bankAccountType;
    
    // Hash for comparison in Payout job
    provider.bankDataHash = this.securityService.hash(
      `${data.bankCode}${data.bankBranch}${data.bankAccount}${data.bankAccountDigit}`
    );
    
    provider.bankDataUpdatedAt = new Date();

    await this.providerRepository.save(provider);

    return { message: 'Bank data updated successfully. 24h payout lock active.' };
  }
}

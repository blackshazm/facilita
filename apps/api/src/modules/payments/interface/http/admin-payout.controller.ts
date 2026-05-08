import { Controller, Get, Post, Param, Query, UseGuards, Req } from '@nestjs/common';
import { GetPayoutsUseCase } from '../../application/get-payouts.usecase';
import { AdminApprovePayoutUseCase } from '../../application/admin-approve-payout.usecase';
import { AdminBlockPayoutUseCase } from '../../application/admin-block-payout.usecase';
import { JwtAuthGuard } from '../../../../shared-kernel/guards/jwt-auth.guard';
import { RolesGuard } from '../../../identity/interface/guards/roles.guard';
import { Roles } from '../../../identity/interface/decorators/roles.decorator';
import { UserRole } from '../../../identity/core/user.entity';
import { PayoutStatus } from '../../ports/payout-repository.port';

@Controller('admin/payouts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminPayoutController {
  constructor(
    private readonly getPayoutsUseCase: GetPayoutsUseCase,
    private readonly approvePayoutUseCase: AdminApprovePayoutUseCase,
    private readonly blockPayoutUseCase: AdminBlockPayoutUseCase,
  ) {}

  @Get()
  async getPayouts(
    @Query('status') status?: PayoutStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.getPayoutsUseCase.execute({
      status,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
    });
  }

  @Post(':id/approve')
  async approve(@Param('id') id: string, @Req() req: any) {
    const adminId = req.user.userId;
    return this.approvePayoutUseCase.execute(id, adminId);
  }

  @Post(':id/block')
  async block(@Param('id') id: string, @Req() req: any) {
    const adminId = req.user.userId;
    return this.blockPayoutUseCase.execute(id, adminId);
  }
}

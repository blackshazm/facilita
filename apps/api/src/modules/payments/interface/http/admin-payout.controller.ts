import { Controller, Get, Post, Param, Query, UseGuards, Req } from '@nestjs/common';
import { GetPayoutsUseCase } from '../../application/get-payouts.usecase';
import { AdminApprovePayoutUseCase } from '../../application/admin-approve-payout.usecase';
import { AdminBlockPayoutUseCase } from '../../application/admin-block-payout.usecase';
import { JwtAuthGuard } from '../../../../shared-kernel/guards/jwt-auth.guard';
import { RolesGuard } from '../../../identity/interface/guards/roles.guard';
import { Roles } from '../../../identity/interface/decorators/roles.decorator';
import { UserRole } from '../../../identity/core/user.entity';
import { PayoutStatus } from '../../ports/payout-repository.port';
import { StartBatchPayoutUseCase } from '../../application/start-batch-payout.usecase';
import { GetBatchStatusUseCase } from '../../application/get-batch-status.usecase';
import { PayoutPort } from '../../ports/payout.port';
import { Inject, Body } from '@nestjs/common';

@Controller('admin/payouts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminPayoutController {
  constructor(
    private readonly getPayoutsUseCase: GetPayoutsUseCase,
    private readonly approvePayoutUseCase: AdminApprovePayoutUseCase,
    private readonly blockPayoutUseCase: AdminBlockPayoutUseCase,
    private readonly startBatchPayoutUseCase: StartBatchPayoutUseCase,
    private readonly getBatchStatusUseCase: GetBatchStatusUseCase,
    @Inject('PayoutPort')
    private readonly payoutPort: PayoutPort,
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

  @Post('batch')
  async startBatch(@Body('payoutIds') payoutIds: string[], @Req() req: any) {
    const adminId = req.user.userId;
    return this.startBatchPayoutUseCase.execute(payoutIds, adminId);
  }

  @Post('bulk/pause')
  async pauseBulkPayouts(@Req() req: any) {
    const adminId = req.user.userId;
    // Log to AuditLog and pause BullMQ queue (mock implementation for Phase 09.2)
    console.log(`[Audit] Admin ${adminId} PAUSE_QUEUE for payouts`);
    return { success: true, message: 'Payout queue paused' };
  }

  @Post('bulk/resume')
  async resumeBulkPayouts(@Req() req: any) {
    const adminId = req.user.userId;
    // Log to AuditLog and resume BullMQ queue (mock implementation for Phase 09.2)
    console.log(`[Audit] Admin ${adminId} RESUME_QUEUE for payouts`);
    return { success: true, message: 'Payout queue resumed' };
  }

  @Get('batch/:id')
  async getBatchStatus(@Param('id') id: string) {
    return this.getBatchStatusUseCase.execute(id);
  }

  @Get('balance')
  async getBalance() {
    const masterRecipientId = process.env.PAGARME_MASTER_RECIPIENT_ID;
    if (!masterRecipientId) return { available: '0' };
    const balance = await this.payoutPort.getBalance(masterRecipientId);
    return { available: balance.toString() };
  }
}

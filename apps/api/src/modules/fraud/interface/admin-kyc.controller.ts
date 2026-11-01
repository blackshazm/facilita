import { Controller, Get, Post, Param, Body, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../shared-kernel/database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

export class RejectKycDto {
  reason: string;
}

@Controller('admin/kyc')
export class AdminKycController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Get('pending')
  async getPendingSubmissions() {
    const submissions = await this.prisma.kycSubmission.findMany({
      where: { status: 'PENDING' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            profile: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return submissions;
  }

  @Post(':id/approve')
  async approveSubmission(@Param('id') id: string) {
    const submission = await this.prisma.kycSubmission.findUnique({
      where: { id },
    });

    if (!submission) {
      throw new NotFoundException(`Submissão KYC ${id} não encontrada.`);
    }

    const updated = await this.prisma.kycSubmission.update({
      where: { id },
      data: {
        status: 'APPROVED',
        rejectionReason: null,
      },
    });

    // Se o usuário tiver ProviderProfile, remove flag de fraude se houver
    await this.prisma.providerProfile.updateMany({
      where: { userId: submission.userId },
      data: { isFlagged: false, fraudReason: null },
    });

    this.eventEmitter.emit('provider.kyc_approved', {
      submissionId: id,
      userId: submission.userId,
    });

    return {
      success: true,
      status: 'APPROVED',
      submissionId: id,
      userId: submission.userId,
    };
  }

  @Post(':id/reject')
  async rejectSubmission(@Param('id') id: string, @Body() dto: RejectKycDto) {
    if (!dto?.reason) {
      throw new BadRequestException('Motivo da rejeição é obrigatório.');
    }

    const submission = await this.prisma.kycSubmission.findUnique({
      where: { id },
    });

    if (!submission) {
      throw new NotFoundException(`Submissão KYC ${id} não encontrada.`);
    }

    const updated = await this.prisma.kycSubmission.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: dto.reason,
      },
    });

    this.eventEmitter.emit('provider.kyc_rejected', {
      submissionId: id,
      userId: submission.userId,
      reason: dto.reason,
    });

    return {
      success: true,
      status: 'REJECTED',
      submissionId: id,
      userId: submission.userId,
      reason: dto.reason,
    };
  }
}


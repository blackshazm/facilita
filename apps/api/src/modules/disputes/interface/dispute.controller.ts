import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared-kernel/guards/jwt-auth.guard';
import { OpenDisputeUseCase } from '../application/open-dispute.usecase';
import { ResolveDisputeUseCase } from '../application/resolve-dispute.usecase';
import { ListDisputesUseCase } from '../application/list-disputes.usecase';
import { DisputeOutcome } from '../domain/dispute.entity';

@Controller('disputes')
export class DisputeController {
  constructor(
    private readonly openDisputeUseCase: OpenDisputeUseCase,
    private readonly resolveDisputeUseCase: ResolveDisputeUseCase,
    private readonly listDisputesUseCase: ListDisputesUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async open(
    @Body()
    body: {
      orderId: string;
      reason: string;
      description: string;
    },
  ) {
    const dispute = await this.openDisputeUseCase.execute(body);
    return dispute.toJSON();
  }

  @Get()
  async list(@Query('pending') pending?: string) {
    const onlyPending = pending === 'true';
    const disputes = await this.listDisputesUseCase.execute(onlyPending);
    return disputes.map(d => d.toJSON());
  }

  @Post(':id/resolve')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async resolve(
    @Param('id') id: string,
    @Body()
    body: {
      outcome: DisputeOutcome;
      notes?: string;
    },
    @Request() req,
  ) {
    const adminId = req?.user?.id ?? 'admin-system';
    const dispute = await this.resolveDisputeUseCase.execute({
      disputeId: id,
      outcome: body.outcome,
      notes: body.notes,
      adminId,
    });
    return dispute.toJSON();
  }
}

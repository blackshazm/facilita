import { Injectable, Inject, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Dispute, DisputeOutcome } from '../domain/dispute.entity';
import { DISPUTE_REPOSITORY_PORT, DisputeRepositoryPort } from '../ports/dispute-repository.port';

export interface ResolveDisputeInput {
  disputeId: string;
  outcome: DisputeOutcome;
  notes?: string;
  adminId?: string;
}

@Injectable()
export class ResolveDisputeUseCase {
  private readonly logger = new Logger(ResolveDisputeUseCase.name);

  constructor(
    @Inject(DISPUTE_REPOSITORY_PORT)
    private readonly disputeRepo: DisputeRepositoryPort,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(input: ResolveDisputeInput): Promise<Dispute> {
    const validOutcomes: DisputeOutcome[] = ['REFUND_FULL', 'SPLIT_50_50', 'RELEASE_PROVIDER'];
    if (!validOutcomes.includes(input.outcome)) {
      throw new BadRequestException(`Desfecho inválido. Use: ${validOutcomes.join(', ')}`);
    }

    const dispute = await this.disputeRepo.findById(input.disputeId);
    if (!dispute) {
      throw new NotFoundException(`Disputa com ID ${input.disputeId} não encontrada`);
    }

    dispute.resolve(input.outcome, input.notes);
    await this.disputeRepo.update(dispute);

    this.logger.log(`Disputa ${dispute.id} resolvida com desfecho: ${input.outcome} pelo admin ${input.adminId ?? 'system'}`);

    this.eventEmitter.emit('dispute.resolved', {
      disputeId: dispute.id,
      orderId: dispute.orderId,
      outcome: input.outcome,
      notes: input.notes,
      adminId: input.adminId,
    });

    return dispute;
  }
}

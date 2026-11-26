import { Injectable, Inject, BadRequestException, ConflictException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Dispute } from '../domain/dispute.entity';
import { DISPUTE_REPOSITORY_PORT, DisputeRepositoryPort } from '../ports/dispute-repository.port';

export interface OpenDisputeInput {
  orderId: string;
  reason: string;
  description: string;
}

@Injectable()
export class OpenDisputeUseCase {
  constructor(
    @Inject(DISPUTE_REPOSITORY_PORT)
    private readonly disputeRepo: DisputeRepositoryPort,
  ) {}

  async execute(input: OpenDisputeInput): Promise<Dispute> {
    if (!input.orderId) {
      throw new BadRequestException('ID do pedido é obrigatório');
    }

    const existingDisputes = await this.disputeRepo.findByOrderId(input.orderId);
    const activeDispute = existingDisputes.find(d => d.status === 'OPEN');
    if (activeDispute) {
      throw new ConflictException(`Já existe uma disputa em aberto para o pedido ${input.orderId}`);
    }

    const dispute = Dispute.create({
      id: randomUUID(),
      orderId: input.orderId,
      reason: input.reason,
      description: input.description,
    });

    await this.disputeRepo.save(dispute);
    return dispute;
  }
}

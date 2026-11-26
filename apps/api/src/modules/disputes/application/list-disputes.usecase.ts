import { Injectable, Inject } from '@nestjs/common';
import { Dispute } from '../domain/dispute.entity';
import { DISPUTE_REPOSITORY_PORT, DisputeRepositoryPort } from '../ports/dispute-repository.port';

@Injectable()
export class ListDisputesUseCase {
  constructor(
    @Inject(DISPUTE_REPOSITORY_PORT)
    private readonly disputeRepo: DisputeRepositoryPort,
  ) {}

  async execute(onlyPending = false): Promise<Dispute[]> {
    if (onlyPending) {
      return this.disputeRepo.findPending();
    }
    return this.disputeRepo.findAll();
  }
}

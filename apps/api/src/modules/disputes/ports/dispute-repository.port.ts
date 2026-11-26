import { Dispute } from '../domain/dispute.entity';

export const DISPUTE_REPOSITORY_PORT = Symbol('DISPUTE_REPOSITORY_PORT');

export interface DisputeRepositoryPort {
  save(dispute: Dispute): Promise<void>;
  findById(id: string): Promise<Dispute | null>;
  findByOrderId(orderId: string): Promise<Dispute[]>;
  findPending(): Promise<Dispute[]>;
  findAll(): Promise<Dispute[]>;
  update(dispute: Dispute): Promise<void>;
}

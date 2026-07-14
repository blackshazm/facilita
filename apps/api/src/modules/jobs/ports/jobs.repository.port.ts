// PRD: 4.2 Solicitação de Serviço e Match
import { JobEntity } from '../core/job.entity';

export const JOBS_REPOSITORY = Symbol('JOBS_REPOSITORY');

export interface JobsRepositoryPort {
  save(job: JobEntity): Promise<void>;
  findById(id: string): Promise<JobEntity | null>;
  findPending(): Promise<JobEntity[]>;
}

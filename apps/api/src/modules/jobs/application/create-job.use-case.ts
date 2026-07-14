// PRD: 4.2 Solicitação de Serviço e Match
import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JobEntity } from '../core/job.entity';
import { JOBS_REPOSITORY, JobsRepositoryPort } from '../ports/jobs.repository.port';

interface CreateJobDto {
  clientId: string;
  serviceId: string;
  totalCents: number;
  addressInfo: string;
}

@Injectable()
export class CreateJobUseCase {
  constructor(
    @Inject(JOBS_REPOSITORY)
    private readonly jobsRepository: JobsRepositoryPort,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(dto: CreateJobDto): Promise<JobEntity> {
    const jobId = Math.random().toString(36).substring(7); // temp ID generation
    
    const job = new JobEntity(
      jobId,
      dto.clientId,
      dto.serviceId,
      dto.totalCents,
      dto.addressInfo
    );

    await this.jobsRepository.save(job);

    // Emite evento de domínio avisando que há um novo job pendente
    this.eventEmitter.emit('job.created', {
      jobId: job.id,
      serviceId: job.serviceId,
      payoutCents: job.payoutCents, // Providers see what they earn, not what client paid
      addressInfo: job.addressInfo,
    });

    return job;
  }
}

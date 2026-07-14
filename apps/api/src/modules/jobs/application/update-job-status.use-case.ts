// PRD: 4.2 Solicitação de Serviço e Match
import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JobEntity, JobStatus } from '../core/job.entity';
import { JOBS_REPOSITORY, JobsRepositoryPort } from '../ports/jobs.repository.port';

interface UpdateJobStatusDto {
  jobId: string;
  providerId: string;
  action: 'ACCEPT' | 'START' | 'COMPLETE';
}

@Injectable()
export class UpdateJobStatusUseCase {
  constructor(
    @Inject(JOBS_REPOSITORY)
    private readonly jobsRepository: JobsRepositoryPort,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(dto: UpdateJobStatusDto): Promise<JobEntity> {
    const job = await this.jobsRepository.findById(dto.jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    if (dto.action === 'ACCEPT') {
      job.accept(dto.providerId);
      this.eventEmitter.emit('job.accepted', { jobId: job.id, providerId: dto.providerId });
    } else if (dto.action === 'START') {
      job.start();
      this.eventEmitter.emit('job.started', { jobId: job.id });
    } else if (dto.action === 'COMPLETE') {
      job.complete();
      this.eventEmitter.emit('job.completed', { 
        jobId: job.id, 
        providerId: dto.providerId, 
        payoutCents: job.payoutCents 
      });
    }

    await this.jobsRepository.save(job);
    return job;
  }
}

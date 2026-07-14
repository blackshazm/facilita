// PRD: 4.2 Solicitação de Serviço e Match
import { Module } from '@nestjs/common';
import { CreateJobUseCase } from './application/create-job.use-case';
import { UpdateJobStatusUseCase } from './application/update-job-status.use-case';
import { JobsController } from './application/jobs.controller';
import { JOBS_REPOSITORY } from './ports/jobs.repository.port';
import { JobEntity } from './core/job.entity';

// Simple in-memory mock repo for MVP until DB is connected
const mockJobsDb: JobEntity[] = [];

const mockJobsRepo = {
  save: async (job: JobEntity) => {
    mockJobsDb.push(job);
  },
  findById: async (id: string) => mockJobsDb.find(j => j.id === id) || null,
  findPending: async () => mockJobsDb.filter(j => j.status === 'PENDING'),
};

@Module({
  controllers: [JobsController],
  providers: [
    CreateJobUseCase,
    UpdateJobStatusUseCase,
    { provide: JOBS_REPOSITORY, useValue: mockJobsRepo },
  ],
})
export class JobsModule {}

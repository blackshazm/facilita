import { Test, TestingModule } from '@nestjs/testing';
import { JobsController } from './jobs.controller';
import { CreateJobUseCase } from './create-job.use-case';
import { UpdateJobStatusUseCase } from './update-job-status.use-case';
import { JobStatus } from '../core/job.entity';

describe('JobsController', () => {
  let controller: JobsController;
  let createJobUseCase: any;
  let updateJobStatusUseCase: any;

  beforeEach(async () => {
    createJobUseCase = { execute: jest.fn() };
    updateJobStatusUseCase = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobsController],
      providers: [
        { provide: CreateJobUseCase, useValue: createJobUseCase },
        { provide: UpdateJobStatusUseCase, useValue: updateJobStatusUseCase },
      ],
    }).compile();

    controller = module.get<JobsController>(JobsController);
  });

  describe('createJob', () => {
    it('should call CreateJobUseCase and return formatted response', async () => {
      createJobUseCase.execute.mockResolvedValue({ id: 'job-1', status: JobStatus.PENDING });

      const dto = {
        clientId: 'client-1',
        serviceId: 'srv-1',
        totalCents: 15000,
        addressInfo: 'Rua A',
      };

      const result = await controller.createJob(dto);

      expect(createJobUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual({
        success: true,
        jobId: 'job-1',
        status: JobStatus.PENDING,
        message: 'Job requested successfully. Searching for providers...',
      });
    });
  });

  describe('updateStatus', () => {
    it('should call UpdateJobStatusUseCase and return updated status', async () => {
      updateJobStatusUseCase.execute.mockResolvedValue({ id: 'job-1', status: JobStatus.ACCEPTED });

      const result = await controller.updateStatus('job-1', {
        providerId: 'provider-1',
        action: 'ACCEPT',
      });

      expect(updateJobStatusUseCase.execute).toHaveBeenCalledWith({
        jobId: 'job-1',
        providerId: 'provider-1',
        action: 'ACCEPT',
      });
      expect(result).toEqual({
        success: true,
        jobId: 'job-1',
        status: JobStatus.ACCEPTED,
      });
    });
  });
});

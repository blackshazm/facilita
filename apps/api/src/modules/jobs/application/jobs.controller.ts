// PRD: 4.2 Solicitação de Serviço e Match
import { Controller, Post, Body, Patch, Param } from '@nestjs/common';
import { CreateJobUseCase } from './create-job.use-case';
import { UpdateJobStatusUseCase } from './update-job-status.use-case';

class CreateJobDto {
  clientId: string;
  serviceId: string;
  totalCents: number;
  addressInfo: string;
}

class UpdateJobStatusDto {
  providerId: string;
  action: 'ACCEPT' | 'START' | 'COMPLETE';
}

@Controller('jobs')
export class JobsController {
  constructor(
    private readonly createJobUseCase: CreateJobUseCase,
    private readonly updateJobStatusUseCase: UpdateJobStatusUseCase,
  ) {}

  @Post()
  async createJob(@Body() body: CreateJobDto) {
    const job = await this.createJobUseCase.execute({
      clientId: body.clientId,
      serviceId: body.serviceId,
      totalCents: body.totalCents,
      addressInfo: body.addressInfo,
    });

    return {
      success: true,
      jobId: job.id,
      status: job.status,
      message: 'Job requested successfully. Searching for providers...',
    };
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: UpdateJobStatusDto) {
    const job = await this.updateJobStatusUseCase.execute({
      jobId: id,
      providerId: body.providerId,
      action: body.action,
    });

    return {
      success: true,
      jobId: job.id,
      status: job.status,
    };
  }
}

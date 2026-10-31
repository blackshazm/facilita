import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async check(@Res() res: Response) {
    const result = await this.healthService.check();
    const httpStatus = result.status === 'ok' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
    return res.status(httpStatus).json(result);
  }

  @Get('ready')
  async ready(@Res() res: Response) {
    const result = await this.healthService.isReady();
    return res
      .status(result.ready ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE)
      .json(result);
  }

  @Get('live')
  live(@Res() res: Response) {
    const result = this.healthService.isLive();
    return res.status(HttpStatus.OK).json(result);
  }
}


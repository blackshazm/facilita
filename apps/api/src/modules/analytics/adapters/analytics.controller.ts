import { Controller, Get, Query, UseGuards, StreamableFile, Res } from '@nestjs/common';
import { Response } from 'express';
import * as csv from 'fast-csv';
import { Readable } from 'stream';
import { JwtAuthGuard } from '../../../shared-kernel/guards/jwt-auth.guard';
import { RolesGuard } from '../../identity/interface/guards/roles.guard';
import { Roles } from '../../identity/interface/decorators/roles.decorator';
import { UserRole } from '../../identity/core/user.entity';
import { GetDailyMetricsUseCase } from '../application/use-cases/get-daily-metrics.usecase';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AnalyticsController {
  constructor(private readonly getDailyMetrics: GetDailyMetricsUseCase) {}

  @Get('daily')
  async getDaily(@Query('days') days?: string) {
    return this.getDailyMetrics.execute(days ? parseInt(days) : 30);
  }

  @Get('export')
  async exportCsv(@Res({ passthrough: true }) res: Response) {
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="daily_metrics.csv"',
    });

    const metrics = await this.getDailyMetrics.execute(365); // Export last year
    const csvStream = csv.format({ headers: true });
    
    const readable = Readable.from(metrics);
    readable.pipe(csvStream);

    return new StreamableFile(csvStream);
  }
}

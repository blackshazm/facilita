import { Controller, Get, Query, UseGuards, StreamableFile, Res } from '@nestjs/common';
import { Response } from 'express';
import * as csv from 'fast-csv';
import { Readable } from 'stream';
import { JwtAuthGuard } from '../../../shared-kernel/guards/jwt-auth.guard';
import { RolesGuard } from '../../identity/interface/guards/roles.guard';
import { Roles } from '../../identity/interface/decorators/roles.decorator';
import { UserRole } from '../../identity/core/user.entity';
import { GetDailyMetricsUseCase } from '../application/use-cases/get-daily-metrics.usecase';

// DTOs (Normally would be in separate files)
export class FinancialMetricsDto {
  payouts: number;
  chargebacks: number;
}

export class QualityMetricsDto {
  ratings: number;
  disputeRatio: number;
  trend: 'up' | 'down' | 'stable';
}

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AnalyticsController {
  constructor(private readonly getDailyMetrics: GetDailyMetricsUseCase) {}

  @Get('daily')
  async getDaily(@Query('days') days?: string) {
    return this.getDailyMetrics.execute(days ? parseInt(days) : 30);
  }

  @Get('financial')
  async getFinancialMetrics(): Promise<FinancialMetricsDto> {
    // Mocked implementation for Phase 09.2
    return {
      payouts: 15420.50,
      chargebacks: 320.00,
    };
  }

  @Get('quality')
  async getQualityMetrics(): Promise<QualityMetricsDto> {
    // Mocked implementation for Phase 09.2
    return {
      ratings: 4.8,
      disputeRatio: 0.02,
      trend: 'up',
    };
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

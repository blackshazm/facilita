import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import * as client from 'prom-client';

@Controller('metrics')
export class MetricsController {
  private readonly register: client.Registry;

  constructor() {
    this.register = client.register;
    // Coleta métricas nativas do runtime Node.js (CPU, Heap, EventLoop)
    client.collectDefaultMetrics({ register: this.register, prefix: 'facilita_' });
  }

  @Get()
  async getMetrics(@Res() res: Response) {
    res.set('Content-Type', this.register.contentType);
    const metrics = await this.register.metrics();
    return res.send(metrics);
  }
}


import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MetricsService } from '../service/metrics.service';
import { Response } from 'express';

@ApiTags('Metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить метрики для Prometheus' })
  async getMetrics(@Res() res: Response): Promise<void> {
    const contentType = this.metricsService.getResponseType();
    res.setHeader('Content-Type', contentType);
    res.send(await this.metricsService.getMetrics());
  }
}

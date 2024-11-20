import { Controller, Get, Header } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MetricsService } from '../service/metrics.service';

@ApiTags('Metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  @ApiOperation({ summary: 'Получить метрики для Prometheus' })
  async getMetrics(): Promise<string> {
    return this.metricsService.getMetrics();
  }
}

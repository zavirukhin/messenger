import { Module } from '@nestjs/common';
import { MetricsController } from './controller/metrics.controller';
import { MetricsService } from './service/metrics.service';

@Module({
  controllers: [MetricsController],
  providers: [MetricsService],
})
export class MetricsModule {}

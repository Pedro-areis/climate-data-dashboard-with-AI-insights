import { Module } from '@nestjs/common';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { WeatherRepository } from './weather.repository';
import { InsightsService } from '../insights/insights.service';

@Module({
  controllers: [WeatherController],
  providers: [WeatherService, WeatherRepository, InsightsService],
})
export class WeatherModule {}

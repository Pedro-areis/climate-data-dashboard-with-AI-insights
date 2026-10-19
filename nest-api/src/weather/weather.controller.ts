import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('weather')
export class WeatherController {
  constructor(private weatherService: WeatherService) {}

  @UseGuards(AuthGuard)
  @Get('all')
  async getWeatherAll() {
    return await this.weatherService.getWeatherAll();
  }

  @UseGuards(AuthGuard)
  @Get('insights/:id')
  async getInsights(@Param('id') id: string) {
    return await this.weatherService.getInsights(id);
  }
}

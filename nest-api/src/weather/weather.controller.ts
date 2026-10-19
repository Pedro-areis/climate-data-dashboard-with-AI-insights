import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { WeatherService } from './weather.service';
import { AuthGuard } from '../auth/auth.guard';
import { ParseObjectIdPipe } from '../common/parse-object-id.pipe';

const MAX_LIMIT = 500;

@ApiBearerAuth()
@Controller('weather')
export class WeatherController {
  constructor(private weatherService: WeatherService) {}

  @UseGuards(AuthGuard)
  @Get('all')
  async getWeatherAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return await this.weatherService.getWeatherAll(
      Math.max(page, 1),
      Math.min(Math.max(limit, 1), MAX_LIMIT),
    );
  }

  @UseGuards(AuthGuard)
  @Get('insights/:id')
  async getInsights(
    @Param('id', ParseObjectIdPipe) id: string,
    @Query('refresh', new DefaultValuePipe(false), ParseBoolPipe)
    refresh: boolean,
  ) {
    return await this.weatherService.getInsights(id, refresh);
  }
}

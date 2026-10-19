import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WeatherRepository } from './weather.repository';
import { InsightsService, WeatherData } from 'src/insights/insights.service';

@Injectable()
export class WeatherService {
  constructor(
    private repository: WeatherRepository,
    private insightsService: InsightsService,
  ) {}

  async getWeatherAll() {
    return await this.repository.getWeatherAll();
  }

  async getInsights(id: string) {
    const data = await this.repository.getInsight(id);

    if (!data) {
      throw new NotFoundException(`Weather data with id ${id} not found`);
    }

    const dataWeather: WeatherData = {
      id: data?.id,
      localization: data?.localization,
      temp: data?.temp,
      humidity: data?.humidity,
      windSpeed: data?.windSpeed,
      conditionSky: data?.conditionSky,
      probabilityRain: data?.probabilityRain,
      insightsAI: data?.insightsAI,
      measuredAt: data?.measuredAt,
    };
    const dataInsight =
      await this.insightsService.generatedInsight(dataWeather);

    if (!dataInsight) {
      throw new BadRequestException('Não foi possível gerar insight');
    }

    await this.repository.newInsight(dataInsight, id);

    return dataInsight;
  }
}

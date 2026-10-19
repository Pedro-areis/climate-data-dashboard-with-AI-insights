import { Injectable, NotFoundException } from '@nestjs/common';
import { WeatherRepository } from './weather.repository';
import { InsightsService, WeatherData } from '../insights/insights.service';

@Injectable()
export class WeatherService {
  constructor(
    private repository: WeatherRepository,
    private insightsService: InsightsService,
  ) {}

  async getWeatherAll(page: number, limit: number) {
    const { items, total } = await this.repository.getWeatherPage(
      (page - 1) * limit,
      limit,
    );

    return { items, total, page, limit };
  }

  async getInsights(id: string, refresh = false) {
    const data = await this.repository.getInsight(id);

    if (!data) {
      throw new NotFoundException(`Weather data with id ${id} not found`);
    }

    // Insight já gerado e salvo: não chama o LLM de novo.
    if (data.insightsAI && !refresh) {
      return data.insightsAI;
    }

    const dataWeather: WeatherData = {
      id: data.id,
      localization: data.localization,
      temp: data.temp,
      humidity: data.humidity,
      windSpeed: data.windSpeed,
      conditionSky: data.conditionSky,
      probabilityRain: data.probabilityRain,
      insightsAI: data.insightsAI,
      measuredAt: data.measuredAt,
    };

    const insight = await this.insightsService.generatedInsight(dataWeather);

    // Só persiste texto do LLM; a regra local é barata e não deve travar o registro.
    if (insight.fromLlm) {
      await this.repository.newInsight(insight.text, id);
    }

    return insight.text;
  }
}

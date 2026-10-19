import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface WeatherData {
  id?: string;
  localization?: string;
  temp?: number;
  humidity?: number;
  windSpeed?: number;
  conditionSky?: string;
  probabilityRain?: number;
  insightsAI?: string | null;
  measuredAt?: Date;
  createdAt?: Date;
}

export interface GeneratedInsight {
  text: string;
  // false quando o texto veio da regra local (LLM não configurado ou indisponível).
  fromLlm: boolean;
}

const DEFAULT_MODEL = 'openai/gpt-oss-120b';

@Injectable()
export class InsightsService {
  private openai: OpenAI | null = null;
  private readonly model: string;
  private readonly logger = new Logger(InsightsService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.model = this.configService.get<string>('LLM_MODEL') || DEFAULT_MODEL;

    // Chave vazia ou ainda com o placeholder do .env.example = LLM desligado.
    if (apiKey && !apiKey.startsWith('<')) {
      this.openai = new OpenAI({
        apiKey,
        baseURL: this.configService.get<string>('OPENAI_BASE_URL'),
        timeout: 20_000,
        maxRetries: 1,
      });
    } else {
      this.logger.warn(
        'OPENAI_API_KEY não configurada: insights usarão a regra local.',
      );
    }
  }

  async generatedInsight(data: WeatherData): Promise<GeneratedInsight> {
    if (!this.openai) {
      return { text: this.ruleBasedInsight(data), fromLlm: false };
    }

    const prompt = `
      Atue como um assistente pessoal meteorológico.
      Analise os dados abaixo da minha cidade e me dê um conselho curto (máximo 2 frases)
      sobre o que vestir ou fazer. Responda em português do Brasil.

      Dados atuais:
      - Temperatura: ${data.temp}°C
      - Condição: ${data.conditionSky}
      - Chuva: ${data.probabilityRain}% de chance
      - Vento: ${data.windSpeed} km/h
      - Umidade: ${data.humidity}%
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });

      const text = response.choices[0]?.message?.content?.trim();
      if (!text) throw new Error('Resposta vazia do LLM');

      return { text, fromLlm: true };
    } catch (error) {
      this.logger.error(
        'Erro ao gerar o insight com LLM; usando regra local.',
        error,
      );
      return { text: this.ruleBasedInsight(data), fromLlm: false };
    }
  }

  // Alternativa determinística para quando o LLM não está disponível.
  private ruleBasedInsight(data: WeatherData): string {
    const temp = data.temp ?? 0;
    const rain = data.probabilityRain ?? 0;
    const wind = data.windSpeed ?? 0;
    const humidity = data.humidity ?? 0;

    const parts: string[] = [];

    if (temp >= 30) parts.push('Calor forte: roupas leves e hidratação em dia.');
    else if (temp >= 22) parts.push('Temperatura agradável: roupa leve resolve.');
    else if (temp >= 15) parts.push('Clima ameno: leve um casaco fino.');
    else parts.push('Frio: vale agasalho e roupas em camadas.');

    if (rain >= 60) parts.push('Alta chance de chuva, não saia sem guarda-chuva.');
    else if (rain >= 30) parts.push('Há chance de chuva; leve um guarda-chuva.');

    if (wind >= 30) parts.push('Vento forte, cuidado com objetos soltos.');
    if (humidity <= 30) parts.push('Ar seco: beba bastante água.');

    return parts.slice(0, 2).join(' ');
  }
}

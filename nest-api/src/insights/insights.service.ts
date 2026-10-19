import { Injectable, Logger } from "@nestjs/common";
import OpenAI from "openai";
import { ConfigService } from '@nestjs/config';

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

@Injectable()
export class InsightsService {
    private openai: OpenAI;
    private readonly logger = new Logger(InsightsService.name);

    constructor(private configService: ConfigService) {
        this.openai = new OpenAI({
            apiKey: this.configService.get<string>('OPENAI_API_KEY'),
            baseURL: this.configService.get('OPENAI_BASE_URL')
        })
    }

    async generatedInsight(data: WeatherData | null) {
        const prompt = `
            Atue como um assistente pessoal meteorológico sarcástico e engraçado.
            Analise os dados abaixo da minha cidade e me dê um conselho curto (máximo 2 frases)
            sobre o que vestir ou fazer.
            
            Dados atuais:
            - Temperatura: ${data?.temp}°C
            - Condição: ${data?.conditionSky}
            - Chuva: ${data?.probabilityRain}% de chance
            - Vento: ${data?.windSpeed} km/h
            - Umidade: ${data?.humidity}%
        `;

        try {
            const response = await this.openai.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages: [{
                    role: 'user',
                    content: prompt
                }],
                temperature: 0.7
            });

            const insight = response.choices[0].message.content;
            this.logger.log('Insight gerado com sucesso:', insight);

            return insight;

        } catch (error) {
            this.logger.error('Erro ao gerar o insight.', error);
            throw new Error('Erro ao gerar o insight.');
        }

    }
}
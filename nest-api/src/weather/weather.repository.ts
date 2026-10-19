import { Injectable } from "@nestjs/common";
import { WeatherData } from "src/insights/insights.service";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class WeatherRepository {
    constructor(private prisma: PrismaService) { }

    async getWeatherAll() {
        return await this.prisma.weather.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }

    async newInsight(insight: string, id: string) {
        return await this.prisma.weather.update({
            where: { id: id },
            data: { insightsAI: insight }
        })
    }

    async getInsight(id: string) {
        const data = await this.prisma.weather.findUnique({ 
                where: { id: id },
            });

        return data;
    }
}
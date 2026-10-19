import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WeatherRepository {
  constructor(private prisma: PrismaService) {}

  async getWeatherPage(skip: number, take: number) {
    const [items, total] = await Promise.all([
      this.prisma.weather.findMany({
        orderBy: { measuredAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.weather.count(),
    ]);

    return { items, total };
  }

  async newInsight(insight: string, id: string) {
    return await this.prisma.weather.update({
      where: { id },
      data: { insightsAI: insight },
    });
  }

  async getInsight(id: string) {
    return await this.prisma.weather.findUnique({ where: { id } });
  }
}

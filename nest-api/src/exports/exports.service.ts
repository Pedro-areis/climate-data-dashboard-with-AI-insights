import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const COLUMNS = [
  'id',
  'localization',
  'temp',
  'humidity',
  'windSpeed',
  'conditionSky',
  'probabilityRain',
  'insightsAI',
  'measuredAt',
  'createdAt',
] as const;

@Injectable()
export class ExportsService {
  constructor(private prisma: PrismaService) {}

  async dataExport() {
    return await this.prisma.weather.findMany({
      orderBy: { measuredAt: 'desc' },
    });
  }

  // Escapa conforme RFC 4180: aspas duplicadas e campo entre aspas quando
  // houver vírgula, aspas ou quebra de linha.
  private escapeCsv(value: unknown): string {
    if (value === null || value === undefined) return '';
    const text = value instanceof Date ? value.toISOString() : String(value);
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  async dataTransformerCsv(data: Record<string, unknown>[]) {
    const header = COLUMNS.join(',');
    const rows = data.map((item) =>
      COLUMNS.map((column) => this.escapeCsv(item[column])).join(','),
    );

    return [header, ...rows].join('\r\n');
  }
}

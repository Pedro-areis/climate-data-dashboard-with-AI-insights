import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ExportsService {
  constructor(private prisma: PrismaService) {}

  async dataExport() {
    return await this.prisma.weather.findMany();
  }

  async dataTransformerCsv(data: any[]) {
    if (!data.length) return '';

    const header = Object.keys(data[0]).join(',');

    const rows = data.map((item) => Object.values(item).join(',')).join('\n');

    return `${header}\n${rows}`;
  }
}

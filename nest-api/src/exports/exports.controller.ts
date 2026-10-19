import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { ExportsService } from './exports.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { type Response } from 'express';

@Controller('exports')
export class ExportsController {
  constructor(private exportsService: ExportsService) {}

  @UseGuards(AuthGuard)
  @Get()
  async dataExport(@Res() res: Response) {
    const data = await this.exportsService.dataExport();
    const csv = await this.exportsService.dataTransformerCsv(data);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=data.csv');
    res.send(csv);
  }
}

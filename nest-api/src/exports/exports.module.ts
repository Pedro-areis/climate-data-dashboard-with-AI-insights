import { Module } from '@nestjs/common';
import { ExportsService } from './exports.service';
import { ExportsController } from './exports.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [ExportsService],
  controllers: [ExportsController]
})
export class ExportsModule {}

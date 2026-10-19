import { Module } from '@nestjs/common';
import { WeatherModule } from './weather/weather.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { ExportsModule } from './exports/exports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
  WeatherModule, UsersModule, ExportsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

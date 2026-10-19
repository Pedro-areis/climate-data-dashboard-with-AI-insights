import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AuthGuard } from './auth.guard';

// JwtModule é registrado aqui (com registerAsync) para ler JWT_SECRET depois
// que o ConfigModule já carregou o .env.
@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  providers: [AuthGuard],
  exports: [AuthGuard, JwtModule],
})
export class AuthModule {}

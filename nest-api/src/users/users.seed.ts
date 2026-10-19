import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { UsersRepository } from './users.repository';
import { GUEST_EMAIL } from './users.service';

// Cria (uma única vez) o usuário visitante usado no login de demonstração.
@Injectable()
export class UsersSeed implements OnApplicationBootstrap {
  private readonly logger = new Logger(UsersSeed.name);

  constructor(
    private repository: UsersRepository,
    private config: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    if (this.config.get('SEED_GUEST_USER') === 'false') return;

    try {
      const existing = await this.repository.findUserByEmail(GUEST_EMAIL);
      if (existing) return;

      await this.repository.createUser({
        name: 'Visitante',
        email: GUEST_EMAIL,
        password: this.config.get('GUEST_PASSWORD') || '12345678',
      });
      this.logger.log(`Usuário visitante criado (${GUEST_EMAIL}).`);
    } catch (error) {
      this.logger.error('Falha ao criar o usuário visitante.', error);
    }
  }
}

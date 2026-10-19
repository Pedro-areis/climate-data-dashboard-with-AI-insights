import { Module } from '@nestjs/common';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { UsersSeed } from './users.seed';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, UsersSeed],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}

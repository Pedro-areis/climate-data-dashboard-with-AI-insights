import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { UsersService } from './users.service';
import { UserRequestDTO } from './dtos/userRequestDTO';
import { LoginRequestDTO } from './dtos/loginRequestDTO';
import { AuthGuard } from '../auth/auth.guard';
import { UpdateUserRequest } from './dtos/updateUserDTO';
import { ParseObjectIdPipe } from '../common/parse-object-id.pipe';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('register')
  async createUser(@Body() data: UserRequestDTO) {
    return await this.usersService.createUser(data);
  }

  @Post('login')
  async loginUser(@Body() body: LoginRequestDTO) {
    return await this.usersService.findUserByEmail(body);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('me')
  async getUser(@Request() request) {
    return request.user;
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch('update/:id')
  async updateUser(
    @Request() request,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() data: UpdateUserRequest,
  ) {
    return await this.usersService.updateUser(request.user, id, data);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete('delete/:id')
  async deleteUser(
    @Request() request,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    return await this.usersService.deleteUser(request.user, id);
  }
}

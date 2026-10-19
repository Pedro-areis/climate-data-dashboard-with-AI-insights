import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Request } from '@nestjs/common';

import { UsersService } from './users.service';
import { UserRequestDTO } from './dtos/userRequestDTO';
import { LoginRequestDTO } from './dtos/loginRequestDTO';
import { AuthGuard } from '../auth/auth.guard';
import { UpdateUserRequest } from './dtos/updateUserDTO';

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

  @UseGuards(AuthGuard)
  @Get('me')
  async getUser(@Request() request) {
    return request.user;
  }

  @UseGuards(AuthGuard)
  @Patch('update/:id')
  async updateUser(@Param('id') id: string, 
                  @Body() data: UpdateUserRequest) {
    return await this.usersService.updateUser(id, data);
  }

  @UseGuards(AuthGuard)
  @Delete('delete/:id')
  async deleteUser(@Param('id') id: string) {
    const userDeleted =  await this.usersService.deleteUser(id);

    return userDeleted;
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '../prisma/prisma.service';
import { UserRequestDTO } from './dtos/userRequestDTO';
import { UserResponseDTO } from './dtos/userResponseDTO';
import { UsersRepository } from './users.repository';
import { LoginRequestDTO } from './dtos/loginRequestDTO';
import { LoginResponseDTO } from './dtos/loginResponseDTO';
import { UpdateUserRequest } from './dtos/updateUserDTO';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private repository: UsersRepository,
    private jwtService: JwtService,
  ) {}

  async createUser(data: UserRequestDTO): Promise<UserResponseDTO> {
    const userAlreadyExists = await this.prisma.users.findUnique({
      where: { email: data.email },
    });

    if (userAlreadyExists) {
      throw new Error('User already exists');
    }

    const user = await this.repository.createUser(data);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }

  async findUserByEmail(data: LoginRequestDTO): Promise<LoginResponseDTO> {
    const user = await this.repository.findUserByEmail(data.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const acessToken = await this.jwtService.sign({
      id: user.id,
      email: user.email,
    });

    return {
      token: acessToken,
    };
  }

  async updateUser(id: string, data: UpdateUserRequest) {
    return await this.repository.updateUser(id, data);
  }

  async deleteUser(id: string): Promise<string> {
    try {
      await this.repository.deleteUser(id);
    } catch (error) {
      throw new Error('Error deleting user');
    }
    return 'User deleted successfully';
  }
}

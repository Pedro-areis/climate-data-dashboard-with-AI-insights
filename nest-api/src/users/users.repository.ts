/* eslint-disable */
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { UserRequestDTO } from './dtos/userRequestDTO';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserRequest } from './dtos/updateUserDTO';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(data: UserRequestDTO) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return await this.prisma.users.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  async findUserByEmail(email: string) {
    return await this.prisma.users.findUnique({
      where: { email },
    });
  }

  async updateUser(id: string, data: UpdateUserRequest) {
    const existingUser = await this.prisma.users.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new Error('User not found');
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    const updatedData = {
      name: data.name == '' ? existingUser.name : data.name,
      email: data.email == '' ? existingUser.email : data.email,
      password: data.password == '' ? existingUser.password : data.password,
    };

    return await this.prisma.users.update({
      where: { id },
      data: updatedData,
    });
  }

  async deleteUser(id: string) {
    return await this.prisma.users.delete({
      where: { id },
    });
  }
}

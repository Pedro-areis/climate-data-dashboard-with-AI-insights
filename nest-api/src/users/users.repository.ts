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

  async findUserById(id: string) {
    return await this.prisma.users.findUnique({
      where: { id },
    });
  }

  // Campos vazios ou ausentes mantêm o valor atual.
  async updateUser(id: string, data: UpdateUserRequest) {
    const updatedData: { name?: string; email?: string; password?: string } =
      {};

    if (data.name) updatedData.name = data.name;
    if (data.email) updatedData.email = data.email;
    if (data.password) {
      updatedData.password = await bcrypt.hash(data.password, 10);
    }

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

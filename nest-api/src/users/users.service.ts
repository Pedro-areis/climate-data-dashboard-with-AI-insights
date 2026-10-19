import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { UserRequestDTO } from './dtos/userRequestDTO';
import { UserResponseDTO } from './dtos/userResponseDTO';
import { UsersRepository } from './users.repository';
import { LoginRequestDTO } from './dtos/loginRequestDTO';
import { LoginResponseDTO } from './dtos/loginResponseDTO';
import { UpdateUserRequest } from './dtos/updateUserDTO';

export const GUEST_EMAIL = 'visitante@gmail.com';

@Injectable()
export class UsersService {
  constructor(
    private repository: UsersRepository,
    private jwtService: JwtService,
  ) {}

  async createUser(data: UserRequestDTO): Promise<UserResponseDTO> {
    const userAlreadyExists = await this.repository.findUserByEmail(data.email);

    if (userAlreadyExists) {
      throw new ConflictException('User already exists');
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

    const accessToken = await this.jwtService.signAsync({
      id: user.id,
      email: user.email,
    });

    return {
      token: accessToken,
    };
  }

  // Cada usuário só pode alterar/apagar a si mesmo, e o visitante é somente leitura.
  private assertCanModify(authUser: UserResponseDTO, id: string) {
    if (authUser.id !== id) {
      throw new ForbiddenException('You can only modify your own account');
    }
    if (authUser.email === GUEST_EMAIL) {
      throw new ForbiddenException('The guest account is read-only');
    }
  }

  async updateUser(
    authUser: UserResponseDTO,
    id: string,
    data: UpdateUserRequest,
  ): Promise<UserResponseDTO> {
    this.assertCanModify(authUser, id);

    const existingUser = await this.repository.findUserById(id);

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    if (data.email && data.email !== existingUser.email) {
      const emailInUse = await this.repository.findUserByEmail(data.email);
      if (emailInUse) {
        throw new ConflictException('E-mail already in use');
      }
    }

    const user = await this.repository.updateUser(id, data);

    return { id: user.id, name: user.name, email: user.email };
  }

  async deleteUser(authUser: UserResponseDTO, id: string): Promise<string> {
    this.assertCanModify(authUser, id);

    const existingUser = await this.repository.findUserById(id);

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    await this.repository.deleteUser(id);

    return 'User deleted successfully';
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserRequest {
  @ApiProperty({ example: 'Pedro Reis' })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({ example: 'pedro@gmail.com' })
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty({ example: '12345678' })
  @IsOptional()
  @IsString()
  password: string;
}

export class UpdateUserResponse {
  id: string;
  name?: string;
  email?: string;
  password?: string;
}

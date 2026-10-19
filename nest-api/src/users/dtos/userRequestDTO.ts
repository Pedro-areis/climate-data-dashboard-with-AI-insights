import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class UserRequestDTO {
  @ApiProperty({ example: 'Pedro Reis' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'pedro@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  password: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UserRequestDTO {
  @ApiProperty({ example: 'Pedro Reis' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'pedro@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @MinLength(8)
  password: string;
}

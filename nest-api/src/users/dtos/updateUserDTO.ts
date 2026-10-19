import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, ValidateIf } from 'class-validator';

// Campos vazios significam "não alterar" (o formulário do front envia tudo).
export class UpdateUserRequest {
  @ApiProperty({ example: 'Pedro Reis', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'pedro@gmail.com', required: false })
  @ValidateIf((_, value) => value !== undefined && value !== '')
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '12345678', required: false })
  @IsOptional()
  @IsString()
  password?: string;
}

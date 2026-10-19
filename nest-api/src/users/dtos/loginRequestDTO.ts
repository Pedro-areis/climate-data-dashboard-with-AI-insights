import { IsEmail, IsString } from 'class-validator';

export class LoginRequestDTO {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
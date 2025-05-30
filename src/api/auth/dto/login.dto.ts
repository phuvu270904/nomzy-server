import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Min, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@gmail.com', description: 'Email', required: true  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Abcd1234!', description: 'Password', required: true })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
export class CreateUserDto {
  @ApiProperty({
    example: 'John',
    description: 'The first name of the user',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({
    example: 'Doe',
    description: 'The last name of the user',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({
    example: 'john.doe@gmail.com',
    description: 'The email address of the user',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'Abcd1234!',
    description: 'The password for the user account',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: '0949394939',
    description: 'The phone number of the user',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  phone_number: string;
}

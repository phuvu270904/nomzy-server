import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { RoleEntity } from '../entities/role.entity';

enum Role {
  USER = 'user',
  OWNER = 'owner',
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsArray()
  @IsNotEmpty()
  @IsEnum(Role, { each: true })
  roles: RoleEntity[];

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  phone_number: string;
}

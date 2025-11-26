import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsPhoneNumber, IsString } from 'class-validator';
import { Gender } from 'src/api/users/entities/user.entity';

export class UpdateProfileDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Name of the user',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: 'male',
    description: 'Gender of the user',
    enum: Gender,
    required: false,
  })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiProperty({
    example: '+84938123456',
    description: 'The phone number of the user',
    required: false,
  })
  @IsOptional()
  phone_number?: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'The avatar URL of the user',
    required: false,
  })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({
    example: true,
    description: 'Indicates if the user has completed full registration',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isFullyRegistered?: boolean;
}

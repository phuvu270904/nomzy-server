import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'OldPassword123!',
    description: 'Current password of the user',
    required: true,
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  oldPassword: string;

  @ApiProperty({
    example: 'NewPassword123!',
    description: 'New password for the user account',
    required: true,
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  newPassword: string;
}

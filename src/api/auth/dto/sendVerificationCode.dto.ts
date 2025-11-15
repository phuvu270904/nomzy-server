import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendVerificationCodeDto {
  @ApiProperty({
    example: 'john.doe@gmail.com',
    description: 'The email address to send verification code',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateFcmTokenDto {
  @ApiProperty({
    description: 'FCM token for push notifications',
    example: 'fYdD...',
  })
  @IsNotEmpty()
  @IsString()
  fcm_token: string;
}

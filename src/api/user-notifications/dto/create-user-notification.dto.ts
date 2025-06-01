import { IsNotEmpty, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserNotificationDto {
  @ApiProperty({
    description: 'User ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: 'Notification ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  notificationId: number;

  @ApiPropertyOptional({
    description: 'Whether the notification has been read by the user',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}

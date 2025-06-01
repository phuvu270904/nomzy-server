import { IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserNotificationDto {
  @ApiPropertyOptional({
    description: 'Whether the notification has been read by the user',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}

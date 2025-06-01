import { IsOptional, IsString, IsBoolean, IsUrl } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateNotificationDto {
  @ApiPropertyOptional({
    description: 'Notification title',
    example: 'System Update',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Notification message',
    example: 'The system will undergo maintenance on June 15, 2025 instead.',
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({
    description: 'Notification image URL',
    example: 'https://example.com/images/updated-notification.jpg',
  })
  @IsOptional()
  @IsUrl()
  image?: string;

  @ApiPropertyOptional({
    description: 'Whether the notification is active',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

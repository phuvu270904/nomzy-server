import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserNotificationSettingDto {
  @ApiPropertyOptional({
    description: 'Enable/disable general notifications',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  generalNotification?: boolean;

  @ApiPropertyOptional({
    description: 'Enable/disable vibration for notifications',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  vibrate?: boolean;

  @ApiPropertyOptional({
    description: 'Enable/disable notifications for special offers',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  specialOffers?: boolean;

  @ApiPropertyOptional({
    description: 'Enable/disable notifications for promotions and discounts',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  promoAndDiscount?: boolean;

  @ApiPropertyOptional({
    description: 'Enable/disable notifications for app updates',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  appUpdates?: boolean;
}

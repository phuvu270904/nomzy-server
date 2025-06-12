import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateUserNotificationSettingDto {
  @ApiProperty({
    description: 'User ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: 'Enable/disable general notifications',
    example: true,
    default: true,
  })
  @IsBoolean()
  generalNotification: boolean;

  @ApiProperty({
    description: 'Enable/disable vibration for notifications',
    example: true,
    default: true,
  })
  @IsBoolean()
  vibrate: boolean;

  @ApiProperty({
    description: 'Enable/disable notifications for special offers',
    example: true,
    default: true,
  })
  @IsBoolean()
  specialOffers: boolean;

  @ApiProperty({
    description: 'Enable/disable notifications for promotions and discounts',
    example: true,
    default: true,
  })
  @IsBoolean()
  promoAndDiscount: boolean;

  @ApiProperty({
    description: 'Enable/disable notifications for app updates',
    example: true,
    default: true,
  })
  @IsBoolean()
  appUpdates: boolean;
}

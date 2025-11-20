import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { NotificationSentType } from '../entities/notification-sent.entity';

export class CreateNotificationSentDto {
  @ApiProperty({
    example: 'New Promotion Available',
    description: 'Notification title',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Check out our latest deals and discounts!',
    description: 'Notification message content',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    example: 'https://example.com/image.jpg',
    required: false,
    description: 'Optional notification image URL',
  })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({
    enum: NotificationSentType,
    example: NotificationSentType.ALL_USERS,
    description: 'Type of notification sending',
  })
  @IsEnum(NotificationSentType)
  @IsNotEmpty()
  sentType: NotificationSentType;

  @ApiProperty({
    example: 1,
    required: false,
    description:
      'Target user ID (required for individual_user or individual_restaurant)',
  })
  @IsNumber()
  @IsOptional()
  sentToUserId?: number;
}

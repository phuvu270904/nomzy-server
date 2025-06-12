import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { NotificationSentType } from '../entities/notification-sent.entity';

export class CreateNotificationSentDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  notificationId: number;

  @ApiProperty({
    enum: NotificationSentType,
    example: NotificationSentType.ALL_USERS,
  })
  @IsEnum(NotificationSentType)
  @IsNotEmpty()
  sentType: NotificationSentType;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  sentToUserId?: number;
}

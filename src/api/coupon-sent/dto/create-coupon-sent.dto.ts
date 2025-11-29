import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { CouponSentType } from '../entities/coupon-sent.entity';

export class CreateCouponSentDto {
  @ApiProperty({ 
    example: 1,
    description: 'ID of the coupon to send',
    required: true
  })
  @IsNumber()
  @IsNotEmpty()
  couponId: number;

  @ApiProperty({ 
    enum: CouponSentType, 
    example: CouponSentType.ALL_USERS,
    description: 'Type of distribution: all_users (send to all users), all_restaurants (send to all restaurants), individual_user (send to specific user), individual_restaurant (send to specific restaurant)',
    required: true
  })
  @IsEnum(CouponSentType)
  @IsNotEmpty()
  sentType: CouponSentType;

  @ApiProperty({ 
    example: 1, 
    required: false,
    description: 'User/Restaurant ID when using individual_user or individual_restaurant sent type. Required for individual distributions.'
  })
  @IsNumber()
  @IsOptional()
  sentToUserId?: number;
}

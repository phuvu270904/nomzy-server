import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { CouponSentType } from '../entities/coupon-sent.entity';

export class CreateCouponSentDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  couponId: number;

  @ApiProperty({ enum: CouponSentType, example: CouponSentType.ALL_USERS })
  @IsEnum(CouponSentType)
  @IsNotEmpty()
  sentType: CouponSentType;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  sentToUserId?: number;
}

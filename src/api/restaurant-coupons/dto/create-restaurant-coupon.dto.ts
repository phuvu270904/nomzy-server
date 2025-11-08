import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  Min,
  ValidateIf,
} from 'class-validator';
import { CouponType } from '../../coupons/entities/coupon.entity';

export class CreateRestaurantCouponDto {
  // Option 1: Provide existing couponId
  @ApiProperty({ example: 1, required: false, description: 'ID of existing coupon to add to restaurant' })
  @IsNumber()
  @IsOptional()
  @ValidateIf((o) => !o.name)
  couponId?: number;

  // Option 2: Create new coupon with these fields
  @ApiProperty({ example: 'Summer Discount', required: false, description: 'Name for new coupon' })
  @IsString()
  @IsOptional()
  @ValidateIf((o) => !o.couponId)
  @IsNotEmpty()
  name?: string;

  @ApiProperty({ example: 'SUMMER2025', required: false, description: 'Code for new coupon' })
  @IsString()
  @IsOptional()
  @ValidateIf((o) => !o.couponId)
  @IsNotEmpty()
  code?: string;

  @ApiProperty({ example: 'Get 20% off on your next order', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: CouponType, example: CouponType.PERCENTAGE, required: false })
  @IsEnum(CouponType)
  @IsOptional()
  @ValidateIf((o) => !o.couponId)
  type?: CouponType;

  @ApiProperty({ example: 20, required: false })
  @IsNumber()
  @IsOptional()
  @ValidateIf((o) => !o.couponId)
  @Min(0)
  value?: number;

  @ApiProperty({ example: 50, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  minOrderAmount?: number;

  @ApiProperty({ example: 100, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  maxDiscountAmount?: number;

  @ApiProperty({ example: '2025-06-01T00:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  validFrom?: Date;

  @ApiProperty({ example: '2025-07-31T23:59:59Z', required: false })
  @IsDateString()
  @IsOptional()
  @ValidateIf((o) => !o.couponId)
  validUntil?: Date;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ example: false, required: false, description: 'If true, coupon is available globally' })
  @IsOptional()
  isGlobal?: boolean;

  @ApiProperty({ example: 100, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  usageLimit?: number;
}

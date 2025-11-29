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
  @ApiProperty({ 
    example: 1, 
    required: false, 
    description: 'ID of existing coupon to add to restaurant. Use this option to link an existing coupon to your restaurant. If provided, other fields are not required.'
  })
  @IsNumber()
  @IsOptional()
  @ValidateIf((o) => !o.name)
  couponId?: number;

  // Option 2: Create new coupon with these fields
  @ApiProperty({ 
    example: 'Summer Discount', 
    required: false, 
    description: 'Name for new coupon. Required if couponId is not provided. Use this option to create a new coupon for your restaurant.'
  })
  @IsString()
  @IsOptional()
  @ValidateIf((o) => !o.couponId)
  @IsNotEmpty()
  name?: string;

  @ApiProperty({ 
    example: 'SUMMER2025', 
    required: false, 
    description: 'Unique coupon code for new coupon. Required if couponId is not provided.'
  })
  @IsString()
  @IsOptional()
  @ValidateIf((o) => !o.couponId)
  @IsNotEmpty()
  code?: string;

  @ApiProperty({ 
    example: 'Get 20% off on your next order', 
    required: false,
    description: 'Description of the coupon offer (for new coupon creation)'
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    enum: CouponType, 
    example: CouponType.PERCENTAGE, 
    required: false,
    description: 'Type of discount: percentage or fixed amount. Required if couponId is not provided.'
  })
  @IsEnum(CouponType)
  @IsOptional()
  @ValidateIf((o) => !o.couponId)
  type?: CouponType;

  @ApiProperty({ 
    example: 20, 
    required: false,
    description: 'Discount value (percentage or fixed amount). Required if couponId is not provided.',
    minimum: 0
  })
  @IsNumber()
  @IsOptional()
  @ValidateIf((o) => !o.couponId)
  @Min(0)
  value?: number;

  @ApiProperty({ 
    example: 50, 
    required: false,
    description: 'Minimum order amount required to use this coupon (for new coupon creation)',
    minimum: 0
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  minOrderAmount?: number;

  @ApiProperty({ 
    example: 100, 
    required: false,
    description: 'Maximum discount amount (useful for percentage coupons)',
    minimum: 0
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  maxDiscountAmount?: number;

  @ApiProperty({ 
    example: '2025-06-01T00:00:00Z', 
    required: false,
    description: 'Start date and time when the coupon becomes valid (for new coupon creation)'
  })
  @IsDateString()
  @IsOptional()
  validFrom?: Date;

  @ApiProperty({ 
    example: '2025-07-31T23:59:59Z', 
    required: false,
    description: 'End date and time when the coupon expires. Required if couponId is not provided.'
  })
  @IsDateString()
  @IsOptional()
  @ValidateIf((o) => !o.couponId)
  validUntil?: Date;

  @ApiProperty({ 
    example: true, 
    required: false,
    description: 'Whether the coupon is currently active (for new coupon creation)',
    default: true
  })
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ 
    example: false, 
    required: false, 
    description: 'If true, coupon is available globally across all restaurants (for new coupon creation)',
    default: false
  })
  @IsOptional()
  isGlobal?: boolean;

  @ApiProperty({ 
    example: 100, 
    required: false,
    description: 'Maximum number of times this coupon can be used (0 = unlimited, for new coupon creation)',
    minimum: 0,
    default: 0
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  usageLimit?: number;
}

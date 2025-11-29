import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { CouponType } from '../entities/coupon.entity';

export class CreateCouponDto {
  @ApiProperty({ 
    example: 'Summer Discount',
    description: 'Display name of the coupon',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ 
    example: 'SUMMER2025',
    description: 'Unique coupon code that users will enter',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ 
    example: 'Get 20% off on your next order',
    description: 'Detailed description of the coupon offer',
    required: false
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({ 
    enum: CouponType, 
    example: CouponType.PERCENTAGE,
    description: 'Type of discount: percentage or fixed amount'
  })
  @IsEnum(CouponType)
  type: CouponType;

  @ApiProperty({ 
    example: 20,
    description: 'Discount value (percentage or fixed amount based on type)',
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  value: number;

  @ApiProperty({ 
    example: 50,
    description: 'Minimum order amount required to use this coupon',
    required: false,
    minimum: 0
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  minOrderAmount: number;

  @ApiProperty({ 
    example: 100,
    description: 'Maximum discount amount (useful for percentage coupons)',
    required: false,
    minimum: 0
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  maxDiscountAmount: number;

  @ApiProperty({ 
    example: '2025-06-01T00:00:00Z',
    description: 'Start date and time when the coupon becomes valid',
    required: false
  })
  @IsDateString()
  @IsOptional()
  validFrom: Date;

  @ApiProperty({ 
    example: '2025-07-31T23:59:59Z',
    description: 'End date and time when the coupon expires',
    required: true
  })
  @IsDateString()
  validUntil: Date;

  @ApiProperty({ 
    example: true,
    description: 'Whether the coupon is currently active and can be used',
    required: false,
    default: true
  })
  @IsOptional()
  isActive: boolean;

  @ApiProperty({ 
    example: false,
    description: 'Whether the coupon is available globally or restaurant-specific',
    required: false,
    default: false
  })
  @IsOptional()
  isGlobal: boolean;

  @ApiProperty({ 
    example: 100,
    description: 'Maximum number of times this coupon can be used (0 = unlimited)',
    required: false,
    minimum: 0,
    default: 0
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  usageLimit: number;
}

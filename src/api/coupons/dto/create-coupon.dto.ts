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
  @ApiProperty({ example: 'Summer Discount' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'SUMMER2025' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Get 20% off on your next order' })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({ enum: CouponType, example: CouponType.PERCENTAGE })
  @IsEnum(CouponType)
  type: CouponType;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @Min(0)
  value: number;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  minOrderAmount: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  maxDiscountAmount: number;

  @ApiProperty({ example: '2025-06-01T00:00:00Z' })
  @IsDateString()
  @IsOptional()
  validFrom: Date;

  @ApiProperty({ example: '2025-07-31T23:59:59Z' })
  @IsDateString()
  validUntil: Date;

  @ApiProperty({ example: true })
  @IsOptional()
  isActive: boolean;

  @ApiProperty({ example: false })
  @IsOptional()
  isGlobal: boolean;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  usageLimit: number;
}

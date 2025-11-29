import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateCouponSentDto {
  @ApiProperty({ 
    example: 150,
    description: 'Number of times this coupon has been claimed by users',
    required: false,
    minimum: 0
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  claimedCount?: number;

  @ApiProperty({ 
    example: 85,
    description: 'Number of times this coupon has been used in actual orders',
    required: false,
    minimum: 0
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  usedCount?: number;
}

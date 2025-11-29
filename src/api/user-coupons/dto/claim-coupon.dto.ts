import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class ClaimCouponDto {
  @ApiProperty({ 
    example: 1,
    description: 'ID of the coupon to claim. The coupon must be active and within its validity period.',
    required: true
  })
  @IsNumber()
  @IsNotEmpty()
  couponId: number;
}

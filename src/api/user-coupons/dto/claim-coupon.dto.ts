import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class ClaimCouponDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  couponId: number;
}

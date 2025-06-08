import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateRestaurantCouponDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  couponId: number;
}

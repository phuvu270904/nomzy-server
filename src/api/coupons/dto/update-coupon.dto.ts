import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateCouponDto } from './create-coupon.dto';
import { IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateCouponDto extends PartialType(CreateCouponDto) {
  @ApiProperty({ 
    example: 50,
    description: 'Current number of times this coupon has been used',
    required: false,
    minimum: 0
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  usageCount?: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { UserCouponStatus } from '../entities/user-coupon.entity';

export class UpdateUserCouponDto {
  @ApiProperty({ 
    enum: UserCouponStatus,
    description: 'Status of the user coupon. Values: claimed (coupon is available to use), used (coupon has been applied to an order), expired (coupon validity period has ended)',
    example: UserCouponStatus.USED,
    required: false
  })
  @IsEnum(UserCouponStatus)
  @IsOptional()
  status?: UserCouponStatus;
}

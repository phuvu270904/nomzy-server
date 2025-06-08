import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { UserCouponStatus } from '../entities/user-coupon.entity';

export class UpdateUserCouponDto {
  @ApiProperty({ enum: UserCouponStatus })
  @IsEnum(UserCouponStatus)
  @IsOptional()
  status?: UserCouponStatus;
}

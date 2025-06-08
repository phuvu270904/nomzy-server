import { PartialType } from '@nestjs/swagger';
import { CreateRestaurantCouponDto } from './create-restaurant-coupon.dto';

export class UpdateRestaurantCouponDto extends PartialType(
  CreateRestaurantCouponDto,
) {}

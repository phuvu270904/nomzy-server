import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantCouponsController } from './restaurant-coupons.controller';
import { RestaurantCouponsService } from './restaurant-coupons.service';
import { RestaurantCouponEntity } from './entities/restaurant-coupon.entity';
import { CouponsModule } from '../coupons/coupons.module';

@Module({
  imports: [TypeOrmModule.forFeature([RestaurantCouponEntity]), CouponsModule],
  controllers: [RestaurantCouponsController],
  providers: [RestaurantCouponsService],
  exports: [RestaurantCouponsService],
})
export class RestaurantCouponsModule {}

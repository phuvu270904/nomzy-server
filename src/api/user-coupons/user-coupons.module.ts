import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCouponsController } from './user-coupons.controller';
import { UserCouponsService } from './user-coupons.service';
import { UserCouponEntity } from './entities/user-coupon.entity';
import { CouponsModule } from '../coupons/coupons.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserCouponEntity]), CouponsModule],
  controllers: [UserCouponsController],
  providers: [UserCouponsService],
  exports: [UserCouponsService],
})
export class UserCouponsModule {}

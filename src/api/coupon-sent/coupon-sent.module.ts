import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponSentController } from './coupon-sent.controller';
import { CouponSentService } from './coupon-sent.service';
import { CouponSentEntity } from './entities/coupon-sent.entity';
import { CouponsModule } from '../coupons/coupons.module';
import { UsersModule } from '../users/users.module';
import { UserCouponsModule } from '../user-coupons/user-coupons.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CouponSentEntity]),
    CouponsModule,
    UsersModule,
    UserCouponsModule,
  ],
  controllers: [CouponSentController],
  providers: [CouponSentService],
  exports: [CouponSentService],
})
export class CouponSentModule {}

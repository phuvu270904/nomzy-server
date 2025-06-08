import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RestaurantCouponEntity } from './entities/restaurant-coupon.entity';
import { CreateRestaurantCouponDto } from './dto/create-restaurant-coupon.dto';
import { CouponsService } from '../coupons/coupons.service';

@Injectable()
export class RestaurantCouponsService {
  constructor(
    @InjectRepository(RestaurantCouponEntity)
    private readonly restaurantCouponRepository: Repository<RestaurantCouponEntity>,
    private readonly couponsService: CouponsService,
  ) {}

  async create(
    restaurantId: number,
    createRestaurantCouponDto: CreateRestaurantCouponDto,
  ): Promise<RestaurantCouponEntity> {
    // Check if coupon exists
    await this.couponsService.findOne(createRestaurantCouponDto.couponId);

    // Check if this restaurant already has this coupon
    const existingCoupon = await this.restaurantCouponRepository.findOne({
      where: {
        restaurantId,
        couponId: createRestaurantCouponDto.couponId,
      },
    });

    if (existingCoupon) {
      return existingCoupon;
    }

    const restaurantCoupon = this.restaurantCouponRepository.create({
      restaurantId,
      couponId: createRestaurantCouponDto.couponId,
    });

    return this.restaurantCouponRepository.save(restaurantCoupon);
  }

  async findAllByRestaurant(
    restaurantId: number,
  ): Promise<RestaurantCouponEntity[]> {
    return this.restaurantCouponRepository.find({
      where: { restaurantId },
      relations: ['coupon'],
    });
  }

  async findOne(id: number): Promise<RestaurantCouponEntity> {
    const restaurantCoupon = await this.restaurantCouponRepository.findOne({
      where: { id },
      relations: ['coupon'],
    });

    if (!restaurantCoupon) {
      throw new NotFoundException(`Restaurant coupon with ID ${id} not found`);
    }

    return restaurantCoupon;
  }

  async remove(id: number, restaurantId: number): Promise<void> {
    const restaurantCoupon = await this.restaurantCouponRepository.findOne({
      where: { id, restaurantId },
    });

    if (!restaurantCoupon) {
      throw new NotFoundException(`Restaurant coupon with ID ${id} not found`);
    }

    await this.restaurantCouponRepository.remove(restaurantCoupon);
  }
}

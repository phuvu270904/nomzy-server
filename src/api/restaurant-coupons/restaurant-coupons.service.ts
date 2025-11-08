import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RestaurantCouponEntity } from './entities/restaurant-coupon.entity';
import { CreateRestaurantCouponDto } from './dto/create-restaurant-coupon.dto';
import { CouponsService } from '../coupons/coupons.service';
import { CreateCouponDto } from '../coupons/dto/create-coupon.dto';

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
    let couponId: number;

    // Check if adding existing coupon or creating new one
    if (createRestaurantCouponDto.couponId) {
      await this.couponsService.findOne(createRestaurantCouponDto.couponId);
      couponId = createRestaurantCouponDto.couponId;
    } else if (createRestaurantCouponDto.name && createRestaurantCouponDto.code) {
      if (!createRestaurantCouponDto.type || createRestaurantCouponDto.value === undefined || !createRestaurantCouponDto.validUntil) {
        throw new BadRequestException(
          'When creating a new coupon, type, value, and validUntil are required',
        );
      }

      const createCouponDto: CreateCouponDto = {
        name: createRestaurantCouponDto.name,
        code: createRestaurantCouponDto.code,
        description: createRestaurantCouponDto.description || '',
        type: createRestaurantCouponDto.type,
        value: createRestaurantCouponDto.value,
        minOrderAmount: createRestaurantCouponDto.minOrderAmount || 0,
        maxDiscountAmount: createRestaurantCouponDto.maxDiscountAmount || 0,
        validFrom: createRestaurantCouponDto.validFrom || new Date(),
        validUntil: createRestaurantCouponDto.validUntil,
        isActive: createRestaurantCouponDto.isActive ?? true,
        isGlobal: createRestaurantCouponDto.isGlobal ?? false,
        usageLimit: createRestaurantCouponDto.usageLimit || 0,
      };

      const newCoupon = await this.couponsService.create(createCouponDto);
      couponId = newCoupon.id;
    } else {
      throw new BadRequestException(
        'Either provide couponId to add existing coupon, or provide name, code, type, value, and validUntil to create a new coupon',
      );
    }

    // Check if this restaurant already has this coupon
    const existingCoupon = await this.restaurantCouponRepository.findOne({
      where: {
        restaurantId,
        couponId: couponId,
      },
    });

    if (existingCoupon) {
      return existingCoupon;
    }

    const restaurantCoupon = this.restaurantCouponRepository.create({
      restaurantId,
      couponId: couponId,
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

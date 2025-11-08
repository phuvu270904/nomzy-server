import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RestaurantCouponEntity } from './entities/restaurant-coupon.entity';
import { CreateRestaurantCouponDto } from './dto/create-restaurant-coupon.dto';
import { UpdateRestaurantCouponDto } from './dto/update-restaurant-coupon.dto';
import { CouponsService } from '../coupons/coupons.service';
import { CreateCouponDto } from '../coupons/dto/create-coupon.dto';
import { UpdateCouponDto } from '../coupons/dto/update-coupon.dto';

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

  async update(
    id: number,
    restaurantId: number,
    updateRestaurantCouponDto: UpdateRestaurantCouponDto,
  ): Promise<RestaurantCouponEntity> {
    // Find the restaurant coupon and verify ownership
    const restaurantCoupon = await this.restaurantCouponRepository.findOne({
      where: { id, restaurantId },
      relations: ['coupon'],
    });

    if (!restaurantCoupon) {
      throw new NotFoundException(
        `Restaurant coupon with ID ${id} not found or you don't have permission to update it`,
      );
    }

    // Verify this is not a global coupon (only restaurant-specific coupons can be updated by owners)
    if (restaurantCoupon.coupon.isGlobal) {
      throw new ForbiddenException(
        'Cannot update global coupons. Only restaurant-specific coupons can be updated.',
      );
    }

    // Prepare update DTO for the coupon
    const updateCouponDto: UpdateCouponDto = {};

    if (updateRestaurantCouponDto.name !== undefined) {
      updateCouponDto.name = updateRestaurantCouponDto.name;
    }
    if (updateRestaurantCouponDto.code !== undefined) {
      updateCouponDto.code = updateRestaurantCouponDto.code;
    }
    if (updateRestaurantCouponDto.description !== undefined) {
      updateCouponDto.description = updateRestaurantCouponDto.description;
    }
    if (updateRestaurantCouponDto.type !== undefined) {
      updateCouponDto.type = updateRestaurantCouponDto.type;
    }
    if (updateRestaurantCouponDto.value !== undefined) {
      updateCouponDto.value = updateRestaurantCouponDto.value;
    }
    if (updateRestaurantCouponDto.minOrderAmount !== undefined) {
      updateCouponDto.minOrderAmount = updateRestaurantCouponDto.minOrderAmount;
    }
    if (updateRestaurantCouponDto.maxDiscountAmount !== undefined) {
      updateCouponDto.maxDiscountAmount = updateRestaurantCouponDto.maxDiscountAmount;
    }
    if (updateRestaurantCouponDto.validFrom !== undefined) {
      updateCouponDto.validFrom = updateRestaurantCouponDto.validFrom;
    }
    if (updateRestaurantCouponDto.validUntil !== undefined) {
      updateCouponDto.validUntil = updateRestaurantCouponDto.validUntil;
    }
    if (updateRestaurantCouponDto.isActive !== undefined) {
      updateCouponDto.isActive = updateRestaurantCouponDto.isActive;
    }
    if (updateRestaurantCouponDto.usageLimit !== undefined) {
      updateCouponDto.usageLimit = updateRestaurantCouponDto.usageLimit;
    }

    // Update the coupon
    await this.couponsService.update(restaurantCoupon.couponId, updateCouponDto);

    // Return the updated restaurant coupon with relations
    return this.findOne(id);
  }

  async remove(id: number, restaurantId: number) {
    const restaurantCoupon = await this.restaurantCouponRepository.findOne({
      where: { id, restaurantId },
    });

    if (!restaurantCoupon) {
      throw new NotFoundException(`Restaurant coupon with ID ${id} not found`);
    }

    await this.restaurantCouponRepository.remove(restaurantCoupon);
    await this.couponsService.remove(restaurantCoupon.couponId);
    return { message: 'Restaurant coupon removed successfully' };
  }
}

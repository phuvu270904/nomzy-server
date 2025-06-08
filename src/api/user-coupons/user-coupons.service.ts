import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  UserCouponEntity,
  UserCouponStatus,
} from './entities/user-coupon.entity';
import { ClaimCouponDto } from './dto/claim-coupon.dto';
import { UpdateUserCouponDto } from './dto/update-user-coupon.dto';
import { CouponsService } from '../coupons/coupons.service';

@Injectable()
export class UserCouponsService {
  constructor(
    @InjectRepository(UserCouponEntity)
    private readonly userCouponRepository: Repository<UserCouponEntity>,
    private readonly couponsService: CouponsService,
  ) {}

  async claimCoupon(
    userId: number,
    claimCouponDto: ClaimCouponDto,
  ): Promise<UserCouponEntity> {
    // Check if coupon exists and is active
    const coupon = await this.couponsService.findOne(claimCouponDto.couponId);

    if (!coupon.isActive) {
      throw new BadRequestException('This coupon is no longer active');
    }

    // Check if coupon is expired
    const now = new Date();
    if (coupon.validUntil < now) {
      throw new BadRequestException('This coupon has expired');
    }

    if (coupon.validFrom && coupon.validFrom > now) {
      throw new BadRequestException('This coupon is not yet valid');
    }

    // Check if user already has this coupon
    const existingCoupon = await this.userCouponRepository.findOne({
      where: {
        userId,
        couponId: claimCouponDto.couponId,
        status: UserCouponStatus.CLAIMED,
      },
    });

    if (existingCoupon) {
      throw new BadRequestException('You have already claimed this coupon');
    }

    // Check if usage limit is reached
    if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
      throw new BadRequestException('This coupon has reached its usage limit');
    }

    // Create user coupon
    const userCoupon = this.userCouponRepository.create({
      userId,
      couponId: claimCouponDto.couponId,
      status: UserCouponStatus.CLAIMED,
    });

    // Increment usage count for the coupon
    await this.couponsService.incrementUsageCount(claimCouponDto.couponId);

    return this.userCouponRepository.save(userCoupon);
  }

  async findAllByUser(userId: number): Promise<UserCouponEntity[]> {
    return this.userCouponRepository.find({
      where: { userId },
      relations: ['coupon'],
    });
  }

  async findUserActiveCoupons(userId: number): Promise<UserCouponEntity[]> {
    return this.userCouponRepository.find({
      where: {
        userId,
        status: UserCouponStatus.CLAIMED,
      },
      relations: ['coupon'],
    });
  }

  async findOne(id: number, userId: number): Promise<UserCouponEntity> {
    const userCoupon = await this.userCouponRepository.findOne({
      where: { id, userId },
      relations: ['coupon'],
    });

    if (!userCoupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }

    return userCoupon;
  }

  async update(
    id: number,
    userId: number,
    updateUserCouponDto: UpdateUserCouponDto,
  ): Promise<UserCouponEntity> {
    const userCoupon = await this.findOne(id, userId);

    // If updating status to USED, set usedAt
    if (updateUserCouponDto.status === UserCouponStatus.USED) {
      userCoupon.usedAt = new Date();
    }

    Object.assign(userCoupon, updateUserCouponDto);
    return this.userCouponRepository.save(userCoupon);
  }

  async markAsExpired(id: number): Promise<UserCouponEntity> {
    const userCoupon = await this.userCouponRepository.findOne({
      where: { id },
    });

    if (!userCoupon) {
      throw new NotFoundException(`User coupon with ID ${id} not found`);
    }

    userCoupon.status = UserCouponStatus.EXPIRED;
    return this.userCouponRepository.save(userCoupon);
  }
}

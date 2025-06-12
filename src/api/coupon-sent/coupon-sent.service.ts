import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CouponSentEntity,
  CouponSentType,
} from './entities/coupon-sent.entity';
import { CreateCouponSentDto } from './dto/create-coupon-sent.dto';
import { UpdateCouponSentDto } from './dto/update-coupon-sent.dto';
import { CouponsService } from '../coupons/coupons.service';
import { UsersService } from '../users/users.service';
import { UserCouponsService } from '../user-coupons/user-coupons.service';
import { RestaurantCouponsService } from '../restaurant-coupons/restaurant-coupons.service';
import { ClaimCouponDto } from '../user-coupons/dto/claim-coupon.dto';
import { CreateRestaurantCouponDto } from '../restaurant-coupons/dto/create-restaurant-coupon.dto';
import { Role } from 'src/roles/role.enum';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class CouponSentService {
  constructor(
    @InjectRepository(CouponSentEntity)
    private readonly couponSentRepository: Repository<CouponSentEntity>,
    private readonly couponsService: CouponsService,
    private readonly usersService: UsersService,
    private readonly userCouponsService: UserCouponsService,
    private readonly restaurantCouponsService: RestaurantCouponsService,
  ) {}

  async create(
    createCouponSentDto: CreateCouponSentDto,
  ): Promise<CouponSentEntity> {
    // Verify coupon exists
    const coupon = await this.couponsService.findOne(
      createCouponSentDto.couponId,
    );

    if (!coupon) {
      throw new NotFoundException(
        `Coupon with ID ${createCouponSentDto.couponId} not found`,
      );
    }

    // Validation for sentToUserId based on sentType
    if (
      (createCouponSentDto.sentType === CouponSentType.INDIVIDUAL_USER ||
        createCouponSentDto.sentType ===
          CouponSentType.INDIVIDUAL_RESTAURANT) &&
      !createCouponSentDto.sentToUserId
    ) {
      throw new BadRequestException(
        'sentToUserId is required for individual user or restaurant',
      );
    }

    // For individual types, verify the target user exists
    if (createCouponSentDto.sentToUserId) {
      const user = await this.usersService.findWithRoles(
        createCouponSentDto.sentToUserId,
      );
      if (!user) {
        throw new NotFoundException(
          `User with ID ${createCouponSentDto.sentToUserId} not found`,
        );
      }

      // For restaurant type, verify user is a restaurant
      if (
        createCouponSentDto.sentType === CouponSentType.INDIVIDUAL_RESTAURANT &&
        user.role === UserRole.OWNER
      ) {
        throw new BadRequestException(
          `User with ID ${createCouponSentDto.sentToUserId} is not a restaurant`,
        );
      }

      // For user type, verify user is not a restaurant
      if (
        createCouponSentDto.sentType === CouponSentType.INDIVIDUAL_USER &&
        user.role !== UserRole.OWNER
      ) {
        throw new BadRequestException(
          `User with ID ${createCouponSentDto.sentToUserId} is a restaurant, not a regular user`,
        );
      }
    }

    // Create record
    const couponSent = this.couponSentRepository.create({
      couponId: createCouponSentDto.couponId,
      sentToUserId: createCouponSentDto.sentToUserId,
      sentType: createCouponSentDto.sentType,
    });

    const savedRecord = await this.couponSentRepository.save(couponSent);

    // Process the coupon sending based on type
    await this.processCouponSending(savedRecord);

    return savedRecord;
  }

  private async processCouponSending(
    couponSent: CouponSentEntity,
  ): Promise<void> {
    switch (couponSent.sentType) {
      case CouponSentType.ALL_USERS:
        await this.sendToAllUsers(couponSent.couponId);
        break;
      case CouponSentType.ALL_RESTAURANTS:
        await this.sendToAllRestaurants(couponSent.couponId);
        break;
      case CouponSentType.INDIVIDUAL_USER:
        if (couponSent.sentToUserId) {
          await this.sendToIndividualUser(
            couponSent.sentToUserId,
            couponSent.couponId,
          );
        }
        break;
      case CouponSentType.INDIVIDUAL_RESTAURANT:
        if (couponSent.sentToUserId) {
          await this.sendToIndividualRestaurant(
            couponSent.sentToUserId,
            couponSent.couponId,
          );
        }
        break;
    }
  }

  private async sendToAllUsers(couponId: number): Promise<void> {
    const users = await this.usersService.findAllUsers();
    for (const user of users) {
      try {
        const claimDto: ClaimCouponDto = { couponId };
        await this.userCouponsService.claimCoupon(user.id, claimDto);
      } catch (error) {
        // Log error but continue with other users
        console.error(
          `Error sending coupon to user ${user.id}: ${error.message}`,
        );
      }
    }
  }

  private async sendToAllRestaurants(couponId: number): Promise<void> {
    const restaurants = await this.usersService.findAllRestaurants();
    for (const restaurant of restaurants) {
      try {
        const createRestaurantCouponDto: CreateRestaurantCouponDto = {
          couponId,
        };
        await this.restaurantCouponsService.create(
          restaurant.id,
          createRestaurantCouponDto,
        );
      } catch (error) {
        // Log error but continue with other restaurants
        console.error(
          `Error sending coupon to restaurant ${restaurant.id}: ${error.message}`,
        );
      }
    }
  }

  private async sendToIndividualUser(
    userId: number,
    couponId: number,
  ): Promise<void> {
    const claimDto: ClaimCouponDto = { couponId };
    await this.userCouponsService.claimCoupon(userId, claimDto);
  }

  private async sendToIndividualRestaurant(
    restaurantId: number,
    couponId: number,
  ): Promise<void> {
    const createRestaurantCouponDto: CreateRestaurantCouponDto = { couponId };
    await this.restaurantCouponsService.create(
      restaurantId,
      createRestaurantCouponDto,
    );
  }

  async findAll(): Promise<CouponSentEntity[]> {
    return this.couponSentRepository.find({
      relations: ['coupon', 'sentToUser'],
    });
  }

  async findOne(id: number): Promise<CouponSentEntity> {
    const couponSent = await this.couponSentRepository.findOne({
      where: { id },
      relations: ['coupon', 'sentToUser'],
    });

    if (!couponSent) {
      throw new NotFoundException(`Coupon sent record with ID ${id} not found`);
    }

    return couponSent;
  }

  async update(
    id: number,
    updateCouponSentDto: UpdateCouponSentDto,
  ): Promise<CouponSentEntity> {
    const couponSent = await this.findOne(id);
    Object.assign(couponSent, updateCouponSentDto);
    return this.couponSentRepository.save(couponSent);
  }

  async remove(id: number): Promise<void> {
    const couponSent = await this.findOne(id);
    await this.couponSentRepository.remove(couponSent);
  }
}

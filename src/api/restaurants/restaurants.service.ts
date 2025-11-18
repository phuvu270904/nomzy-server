import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity, UserRole } from '../users/entities/user.entity';
import { Repository, Like } from 'typeorm';
import { FeedbacksService } from '../feedbacks/feedbacks.service';
import { FavoritesService } from '../favorites/favorites.service';
import { CreateFavoriteDto } from '../favorites/dto/create-favorite.dto';
import { ProductEntity } from '../products/entities/product.entity';
import { RestaurantCouponEntity } from '../restaurant-coupons/entities/restaurant-coupon.entity';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(RestaurantCouponEntity)
    private readonly restaurantCouponRepository: Repository<RestaurantCouponEntity>,
    private readonly feedbacksService: FeedbacksService,
    private readonly favoritesService: FavoritesService,
  ) {}

  async getAllRestaurants(userId?: number) {
    const allUsers = await this.userRepository.find({
      relations: ['products', 'addresses', 'feedbacks'],
    });

    const restaurants = allUsers.filter((user) => user.role === UserRole.OWNER);

    const restaurantInfos = await Promise.all(
      restaurants.map(async (restaurant) => {
        const averageRating = await this.feedbacksService.calcRating(
          restaurant.id,
        );

        // Check if this restaurant is liked by the current user
        let liked = false;
        if (userId) {
          liked = await this.favoritesService.checkIsFavorite(
            userId,
            restaurant.id,
          );
        }

        return {
          id: restaurant.id,
          name: restaurant.name,
          email: restaurant.email,
          phone_number: restaurant.phone_number,
          products: restaurant.products,
          addresses: restaurant.addresses,
          image: restaurant.avatar,
          reviews: restaurant.feedbacks?.length,
          rating: averageRating,
          liked: liked,
        };
      }),
    );

    return restaurantInfos;
  }

  async getRestaurantById(id: number, userId?: number) {
    const restaurant = await this.userRepository.findOne({
      where: { id, role: UserRole.OWNER },
      relations: ['products', 'addresses', 'feedbacks'],
    });

    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    const averageRating = await this.feedbacksService.calcRating(restaurant.id);

    // Check if this restaurant is liked by the current user
    let liked = false;
    if (userId) {
      liked = await this.favoritesService.checkIsFavorite(
        userId,
        restaurant.id,
      );
    }

    const { password, ...safeInfo } = restaurant;

    return {
      ...safeInfo,
      averageRating,
      liked,
    };
  }

  async addToFavorites(userId: number, restaurantId: number) {
    const createFavoriteDto: CreateFavoriteDto = { restaurantId };
    return this.favoritesService.addToFavorites(userId, createFavoriteDto);
  }

  async removeFromFavorites(userId: number, restaurantId: number) {
    return this.favoritesService.removeFavorite(userId, restaurantId);
  }

  async getRestaurantInfo(restaurantId: number) {
    const restaurant = await this.userRepository.findOne({
      where: { id: restaurantId },
      relations: ['products', 'addresses'],
    });

    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    const { password, gender, refresh_token, resetToken, ...safeInfo } =
      restaurant;

    return safeInfo;
  }

  async searchRestaurants(query: string, userId?: number) {
    if (!query || query.trim() === '') {
      return this.getAllRestaurants(userId);
    }

    const searchQuery = `%${query.toLowerCase()}%`;

    // Find restaurants by name
    const restaurantsByName = await this.userRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role: UserRole.OWNER })
      .andWhere('LOWER(user.name) LIKE :query', { query: searchQuery })
      .leftJoinAndSelect('user.products', 'products')
      .leftJoinAndSelect('user.addresses', 'addresses')
      .leftJoinAndSelect('user.feedbacks', 'feedbacks')
      .getMany();

    // Find restaurants by product name
    const productMatches = await this.productRepository
      .createQueryBuilder('product')
      .where('LOWER(product.name) LIKE :query', { query: searchQuery })
      .andWhere('product.isActive = :isActive', { isActive: true })
      .leftJoinAndSelect('product.restaurant', 'restaurant')
      .andWhere('restaurant.role = :role', { role: UserRole.OWNER })
      .getMany();

    // Get unique restaurant IDs from product matches
    const restaurantIdsFromProducts = [
      ...new Set(productMatches.map((p) => p.restaurantId)),
    ];

    // Fetch full restaurant details for product matches
    const restaurantsByProduct =
      restaurantIdsFromProducts.length > 0
        ? await this.userRepository
            .createQueryBuilder('user')
            .where('user.id IN (:...ids)', { ids: restaurantIdsFromProducts })
            .andWhere('user.role = :role', { role: UserRole.OWNER })
            .leftJoinAndSelect('user.products', 'products')
            .leftJoinAndSelect('user.addresses', 'addresses')
            .leftJoinAndSelect('user.feedbacks', 'feedbacks')
            .getMany()
        : [];

    // Combine and deduplicate restaurants
    const restaurantMap = new Map<number, UserEntity>();
    [...restaurantsByName, ...restaurantsByProduct].forEach((restaurant) => {
      restaurantMap.set(restaurant.id, restaurant);
    });

    const uniqueRestaurants = Array.from(restaurantMap.values());

    // Map restaurant info with ratings, favorites, and offers
    const restaurantInfos = await Promise.all(
      uniqueRestaurants.map(async (restaurant) => {
        const averageRating = await this.feedbacksService.calcRating(
          restaurant.id,
        );

        // Check if this restaurant is liked by the current user
        let liked = false;
        if (userId) {
          liked = await this.favoritesService.checkIsFavorite(
            userId,
            restaurant.id,
          );
        }

        // Get restaurant offers/coupons
        const offers = await this.restaurantCouponRepository.find({
          where: { restaurantId: restaurant.id },
          relations: ['coupon'],
        });

        // Filter active coupons
        const activeOffers = offers
          .filter((offer) => {
            const coupon = offer.coupon;
            if (!coupon.isActive) return false;

            const now = new Date();
            if (coupon.validFrom && new Date(coupon.validFrom) > now)
              return false;
            if (coupon.validUntil && new Date(coupon.validUntil) < now)
              return false;

            return true;
          })
          .map((offer) => ({
            id: offer.coupon.id,
            name: offer.coupon.name,
            code: offer.coupon.code,
            description: offer.coupon.description,
            type: offer.coupon.type,
            value: offer.coupon.value,
            minOrderAmount: offer.coupon.minOrderAmount,
            maxDiscountAmount: offer.coupon.maxDiscountAmount,
            validFrom: offer.coupon.validFrom,
            validUntil: offer.coupon.validUntil,
          }));

        return {
          id: restaurant.id,
          name: restaurant.name,
          email: restaurant.email,
          phone_number: restaurant.phone_number,
          products: restaurant.products,
          addresses: restaurant.addresses,
          image: restaurant.avatar,
          reviews: restaurant.feedbacks?.length,
          rating: averageRating,
          liked: liked,
          offers: activeOffers,
        };
      }),
    );

    return restaurantInfos;
  }
}

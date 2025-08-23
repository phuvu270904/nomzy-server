import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity, UserRole } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { FeedbacksService } from '../feedbacks/feedbacks.service';
import { FavoritesService } from '../favorites/favorites.service';
import { CreateFavoriteDto } from '../favorites/dto/create-favorite.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
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
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity, UserRole } from '../users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async getAllRestaurants() {
    const allUsers = await this.userRepository.find({
      relations: ['products', 'roles', 'addresses'],
    });

    const restaurants = allUsers.filter((user) => user.role === UserRole.OWNER);

    const restaurantInfos = restaurants.map((restaurant) => {
      return {
        id: restaurant.id,
        name: restaurant.name,
        email: restaurant.email,
        phone_number: restaurant.phone_number,
        products: restaurant.products,
        addresses: restaurant.addresses,
        avatar: restaurant.avatar,
      };
    });

    return restaurantInfos;
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

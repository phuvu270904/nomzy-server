import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async getRestaurantInfo(restaurantId: number): Promise<UserEntity> {
    const restaurant = await this.userRepository.findOne({
      where: { id: restaurantId },
      relations: ['products'],
    });

    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    return restaurant;
  }
}

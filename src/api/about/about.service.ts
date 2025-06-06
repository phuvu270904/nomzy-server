import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RestaurantAboutEntity } from './entities/restaurant-about.entity';
import { CreateAboutDto } from './dto/create-about.dto';
import { UpdateAboutDto } from './dto/update-about.dto';
import { UserEntity } from '../users/entities/user.entity';

@Injectable()
export class AboutService {
  constructor(
    @InjectRepository(RestaurantAboutEntity)
    private readonly aboutRepository: Repository<RestaurantAboutEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(
    userId: number,
    createAboutDto: CreateAboutDto,
  ): Promise<RestaurantAboutEntity> {
    // Check if the user exists and is a restaurant owner
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if about info already exists for this restaurant
    const existingAbout = await this.aboutRepository.findOne({
      where: { restaurantId: userId },
    });

    if (existingAbout) {
      // Update existing about info
      return this.update(userId, createAboutDto);
    }

    // Create new about info
    const newAbout = this.aboutRepository.create({
      restaurantId: userId,
      overview: createAboutDto.overview,
      schedule: createAboutDto.schedule || {},
    });

    return this.aboutRepository.save(newAbout);
  }

  async findOne(restaurantId: number): Promise<RestaurantAboutEntity> {
    const about = await this.aboutRepository.findOne({
      where: { restaurantId },
    });

    if (!about) {
      const newAbout = this.aboutRepository.create({
        restaurantId,
        overview: '',
        schedule: {},
      });
      return this.aboutRepository.save(newAbout);
    }

    return about;
  }

  async update(
    restaurantId: number,
    updateAboutDto: UpdateAboutDto,
  ): Promise<RestaurantAboutEntity> {
    const about = await this.aboutRepository.findOne({
      where: { restaurantId },
    });

    if (!about) {
      throw new NotFoundException('Restaurant information not found');
    }

    // Update fields
    if (updateAboutDto.overview !== undefined) {
      about.overview = updateAboutDto.overview;
    }

    if (updateAboutDto.schedule !== undefined) {
      about.schedule = {
        ...about.schedule,
        ...updateAboutDto.schedule,
      };
    }

    return this.aboutRepository.save(about);
  }

  async remove(restaurantId: number): Promise<void> {
    const about = await this.aboutRepository.findOne({
      where: { restaurantId },
    });

    if (!about) {
      throw new NotFoundException('Restaurant information not found');
    }

    await this.aboutRepository.remove(about);
  }
}

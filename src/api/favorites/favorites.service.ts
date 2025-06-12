import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FavoriteEntity } from './entities/favorite.entity';
import { UserEntity, UserRole } from '../users/entities/user.entity';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { FavoriteResponseDto } from './dto/favorite-response.dto';
import { Role } from 'src/roles/role.enum';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(FavoriteEntity)
    private readonly favoriteRepository: Repository<FavoriteEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async addToFavorites(
    userId: number,
    createFavoriteDto: CreateFavoriteDto,
  ): Promise<FavoriteResponseDto> {
    const { restaurantId } = createFavoriteDto;

    // Check if restaurant exists and is a restaurant (owner role)
    const restaurant = await this.userRepository.findOne({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    const isRestaurant = restaurant.role === UserRole.OWNER;
    if (!isRestaurant) {
      throw new BadRequestException('Selected user is not a restaurant');
    }

    // Check if already in favorites
    const existingFavorite = await this.favoriteRepository.findOne({
      where: { userId, restaurantId },
    });

    if (existingFavorite) {
      throw new BadRequestException('Restaurant already in favorites');
    }

    // Create new favorite entry
    const favorite = this.favoriteRepository.create({
      userId,
      restaurantId,
    });

    const savedFavorite = await this.favoriteRepository.save(favorite);
    return this.mapToResponseDto(
      await this.findFavoriteWithDetails(savedFavorite.id),
    );
  }

  async removeFavorite(userId: number, restaurantId: number): Promise<void> {
    const favorite = await this.favoriteRepository.findOne({
      where: { userId, restaurantId },
    });

    if (!favorite) {
      throw new NotFoundException('Restaurant not found in favorites');
    }

    await this.favoriteRepository.remove(favorite);
  }

  async getUserFavorites(userId: number): Promise<FavoriteResponseDto[]> {
    const favorites = await this.favoriteRepository.find({
      where: { userId },
      relations: ['restaurant'],
    });

    return favorites.map((favorite) => this.mapToResponseDto(favorite));
  }

  async checkIsFavorite(
    userId: number,
    restaurantId: number,
  ): Promise<boolean> {
    const favorite = await this.favoriteRepository.findOne({
      where: { userId, restaurantId },
    });

    return !!favorite;
  }

  private async findFavoriteWithDetails(id: number): Promise<FavoriteEntity> {
    const favorite = await this.favoriteRepository.findOne({
      where: { id },
      relations: ['restaurant'],
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    return favorite;
  }

  private mapToResponseDto(favorite: FavoriteEntity): FavoriteResponseDto {
    const response = new FavoriteResponseDto();
    response.id = favorite.id;
    response.userId = favorite.userId;
    response.restaurantId = favorite.restaurantId;
    response.createdAt = favorite.createdAt;

    // Add restaurant details if available
    if (favorite.restaurant) {
      response.restaurant = {
        id: favorite.restaurant.id,
        name: favorite.restaurant.name,
        avatar: favorite.restaurant.avatar,
      };
    }

    return response;
  }
}

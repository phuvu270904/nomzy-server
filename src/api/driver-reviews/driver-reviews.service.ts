import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DriverReviewEntity } from './entities/driver-review.entity';
import { CreateDriverReviewDto } from './dto/create-driver-review.dto';
import { UpdateDriverReviewDto } from './dto/update-driver-review.dto';
import { UserEntity, UserRole } from '../users/entities/user.entity';
import { DriverReviewResponseDto } from './dto/driver-review-response.dto';
import { Role } from 'src/roles/role.enum';

@Injectable()
export class DriverReviewsService {
  constructor(
    @InjectRepository(DriverReviewEntity)
    private readonly driverReviewRepository: Repository<DriverReviewEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(
    userId: number,
    driverId: number,
    createDriverReviewDto: CreateDriverReviewDto,
  ): Promise<DriverReviewResponseDto> {
    // Check if driver exists and is actually a driver (has driver role)
    const driver = await this.userRepository.findOne({
      where: { id: driverId },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    const hasDriverRole = driver.role === UserRole.DRIVER;
    if (!hasDriverRole) {
      throw new BadRequestException('The specified user is not a driver');
    }

    // Check if user isn't trying to review themselves
    if (userId === driverId) {
      throw new BadRequestException('You cannot review yourself as a driver');
    }

    // Create new driver review
    const driverReview = this.driverReviewRepository.create({
      userId,
      driverId,
      rating: createDriverReviewDto.rating,
      review: createDriverReviewDto.review,
      isAnonymous: createDriverReviewDto.isAnonymous || false,
    });

    const savedReview = await this.driverReviewRepository.save(driverReview);
    return this.mapToResponseDto(savedReview);
  }

  async findAll(): Promise<DriverReviewResponseDto[]> {
    const reviews = await this.driverReviewRepository.find({
      relations: ['user', 'driver'],
    });

    return reviews.map((review) => this.mapToResponseDto(review));
  }

  async findByDriver(driverId: number): Promise<DriverReviewResponseDto[]> {
    const driver = await this.userRepository.findOne({
      where: { id: driverId },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    const hasDriverRole = driver.role === UserRole.DRIVER;
    if (!hasDriverRole) {
      throw new BadRequestException('The specified user is not a driver');
    }

    const reviews = await this.driverReviewRepository.find({
      where: { driverId },
      relations: ['user', 'driver'],
    });

    return reviews.map((review) => this.mapToResponseDto(review));
  }

  async findByUser(userId: number): Promise<DriverReviewResponseDto[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const reviews = await this.driverReviewRepository.find({
      where: { userId },
      relations: ['user', 'driver'],
    });

    return reviews.map((review) => this.mapToResponseDto(review));
  }

  async findOne(id: number): Promise<DriverReviewResponseDto> {
    const review = await this.driverReviewRepository.findOne({
      where: { id },
      relations: ['user', 'driver'],
    });

    if (!review) {
      throw new NotFoundException('Driver review not found');
    }

    return this.mapToResponseDto(review);
  }

  async update(
    id: number,
    userId: number,
    updateDriverReviewDto: UpdateDriverReviewDto,
  ): Promise<DriverReviewResponseDto> {
    const review = await this.driverReviewRepository.findOne({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Driver review not found');
    }

    // Only the user who created the review can update it
    if (review.userId !== userId) {
      throw new UnauthorizedException('You can only update your own reviews');
    }

    // Update fields
    if (updateDriverReviewDto.rating !== undefined) {
      review.rating = updateDriverReviewDto.rating;
    }

    if (updateDriverReviewDto.review !== undefined) {
      review.review = updateDriverReviewDto.review;
    }

    if (updateDriverReviewDto.isAnonymous !== undefined) {
      review.isAnonymous = updateDriverReviewDto.isAnonymous;
    }

    const updatedReview = await this.driverReviewRepository.save(review);
    return this.mapToResponseDto(updatedReview);
  }

  async remove(id: number, userId: number): Promise<void> {
    const review = await this.driverReviewRepository.findOne({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Driver review not found');
    }

    // Only the user who created the review can delete it
    if (review.userId !== userId) {
      throw new UnauthorizedException('You can only delete your own reviews');
    }

    await this.driverReviewRepository.remove(review);
  }

  private mapToResponseDto(
    review: DriverReviewEntity,
  ): DriverReviewResponseDto {
    const response = new DriverReviewResponseDto();
    response.id = review.id;
    response.userId = review.userId;
    response.driverId = review.driverId;
    response.rating = review.rating;
    response.review = review.review;
    response.isAnonymous = review.isAnonymous;
    response.createdAt = review.createdAt;
    response.updatedAt = review.updatedAt;

    // Add user details if available and not anonymous
    if (review.user && !review.isAnonymous) {
      response.user = {
        id: review.user.id,
        name: review.user.name,
        email: review.user.email,
      };
    }

    // Add driver details if available
    if (review.driver) {
      response.driver = {
        id: review.driver.id,
        name: review.driver.name,
      };
    }

    return response;
  }
}

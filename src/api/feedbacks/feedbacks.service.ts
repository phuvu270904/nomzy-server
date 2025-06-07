import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeedbackEntity } from './entities/feedback.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { UserEntity } from '../users/entities/user.entity';
import { FeedbackResponseDto } from './dto/feedback-response.dto';

@Injectable()
export class FeedbacksService {
  constructor(
    @InjectRepository(FeedbackEntity)
    private readonly feedbackRepository: Repository<FeedbackEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(
    userId: number,
    restaurantId: number,
    createFeedbackDto: CreateFeedbackDto,
  ): Promise<FeedbackResponseDto> {
    // Check if restaurant exists and is a restaurant (owner role)
    const restaurant = await this.userRepository.findOne({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    // Check if user isn't trying to review their own restaurant
    if (userId === restaurantId) {
      throw new BadRequestException('You cannot review your own restaurant');
    }

    // Check if user has already reviewed this restaurant
    const existingReview = await this.feedbackRepository.findOne({
      where: {
        userId,
        restaurantId,
      },
    });

    if (existingReview) {
      throw new BadRequestException(
        'You have already reviewed this restaurant',
      );
    }

    // Create new feedback
    const feedback = this.feedbackRepository.create({
      userId,
      restaurantId,
      rating: createFeedbackDto.rating,
      review: createFeedbackDto.review,
      isAnonymous: createFeedbackDto.isAnonymous || false,
    });

    const savedFeedback = await this.feedbackRepository.save(feedback);
    return this.mapToResponseDto(savedFeedback);
  }

  async findAll(): Promise<FeedbackResponseDto[]> {
    const feedbacks = await this.feedbackRepository.find({
      relations: ['user', 'restaurant'],
    });

    return feedbacks.map((feedback) => this.mapToResponseDto(feedback));
  }

  async findByRestaurant(restaurantId: number): Promise<FeedbackResponseDto[]> {
    const restaurant = await this.userRepository.findOne({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    const feedbacks = await this.feedbackRepository.find({
      where: { restaurantId },
      relations: ['user', 'restaurant'],
    });

    return feedbacks.map((feedback) => this.mapToResponseDto(feedback));
  }

  async findByUser(userId: number): Promise<FeedbackResponseDto[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const feedbacks = await this.feedbackRepository.find({
      where: { userId },
      relations: ['user', 'restaurant'],
    });

    return feedbacks.map((feedback) => this.mapToResponseDto(feedback));
  }

  async findOne(id: number): Promise<FeedbackResponseDto> {
    const feedback = await this.feedbackRepository.findOne({
      where: { id },
      relations: ['user', 'restaurant'],
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    return this.mapToResponseDto(feedback);
  }

  async update(
    id: number,
    userId: number,
    updateFeedbackDto: UpdateFeedbackDto,
  ): Promise<FeedbackResponseDto> {
    const feedback = await this.feedbackRepository.findOne({
      where: { id },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    // Only the user who created the feedback can update it
    if (feedback.userId !== userId) {
      throw new UnauthorizedException('You can only update your own feedbacks');
    }

    // Update fields
    if (updateFeedbackDto.rating !== undefined) {
      feedback.rating = updateFeedbackDto.rating;
    }

    if (updateFeedbackDto.review !== undefined) {
      feedback.review = updateFeedbackDto.review;
    }

    if (updateFeedbackDto.isAnonymous !== undefined) {
      feedback.isAnonymous = updateFeedbackDto.isAnonymous;
    }

    const updatedFeedback = await this.feedbackRepository.save(feedback);
    return this.mapToResponseDto(updatedFeedback);
  }

  async remove(id: number, userId: number): Promise<void> {
    const feedback = await this.feedbackRepository.findOne({
      where: { id },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    // Only the user who created the feedback can delete it
    if (feedback.userId !== userId) {
      throw new UnauthorizedException('You can only delete your own feedbacks');
    }

    await this.feedbackRepository.remove(feedback);
  }

  private mapToResponseDto(feedback: FeedbackEntity): FeedbackResponseDto {
    const response = new FeedbackResponseDto();
    response.id = feedback.id;
    response.userId = feedback.userId;
    response.restaurantId = feedback.restaurantId;
    response.rating = feedback.rating;
    response.review = feedback.review;
    response.isAnonymous = feedback.isAnonymous;
    response.createdAt = feedback.createdAt;
    response.updatedAt = feedback.updatedAt;

    // Add user details if available and not anonymous
    if (feedback.user && !feedback.isAnonymous) {
      response.user = {
        id: feedback.user.id,
        name: feedback.user.name,
        email: feedback.user.email,
      };
    }

    // Add restaurant details if available
    if (feedback.restaurant) {
      response.restaurant = {
        id: feedback.restaurant.id,
        name: feedback.restaurant.name,
      };
    }

    return response;
  }
}

import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DriverFeedbackEntity } from './entities/driver-feedback.entity';
import { CreateDriverFeedbackDto } from './dto/create-driver-feedback.dto';
import { UpdateDriverFeedbackDto } from './dto/update-driver-feedback.dto';
import { UserEntity, UserRole } from '../users/entities/user.entity';
import { DriverFeedbackResponseDto } from './dto/driver-feedback-response.dto';

@Injectable()
export class DriverFeedbacksService {
  constructor(
    @InjectRepository(DriverFeedbackEntity)
    private readonly driverFeedbackRepository: Repository<DriverFeedbackEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(
    userId: number,
    driverId: number,
    createDriverFeedbackDto: CreateDriverFeedbackDto,
  ): Promise<DriverFeedbackResponseDto> {
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

    // Check if user isn't trying to give feedback to themselves
    if (userId === driverId) {
      throw new BadRequestException(
        'You cannot give feedback to yourself as a driver',
      );
    }

    // Create new driver feedback
    const driverFeedback = this.driverFeedbackRepository.create({
      userId,
      driverId,
      rating: createDriverFeedbackDto.rating,
      feedback: createDriverFeedbackDto.feedback,
      isAnonymous: createDriverFeedbackDto.isAnonymous || false,
    });

    const savedFeedback =
      await this.driverFeedbackRepository.save(driverFeedback);
    return this.mapToResponseDto(savedFeedback);
  }

  async findAll(): Promise<DriverFeedbackResponseDto[]> {
    const feedbacks = await this.driverFeedbackRepository.find({
      relations: ['user', 'driver'],
    });

    return feedbacks.map((feedback) => this.mapToResponseDto(feedback));
  }

  async findByDriver(driverId: number): Promise<DriverFeedbackResponseDto[]> {
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

    const feedbacks = await this.driverFeedbackRepository.find({
      where: { driverId },
      relations: ['user', 'driver'],
    });

    return feedbacks.map((feedback) => this.mapToResponseDto(feedback));
  }

  async findByUser(userId: number): Promise<DriverFeedbackResponseDto[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const feedbacks = await this.driverFeedbackRepository.find({
      where: { userId },
      relations: ['user', 'driver'],
    });

    return feedbacks.map((feedback) => this.mapToResponseDto(feedback));
  }

  async findOne(id: number): Promise<DriverFeedbackResponseDto> {
    const feedback = await this.driverFeedbackRepository.findOne({
      where: { id },
      relations: ['user', 'driver'],
    });

    if (!feedback) {
      throw new NotFoundException('Driver feedback not found');
    }

    return this.mapToResponseDto(feedback);
  }

  async update(
    id: number,
    userId: number,
    updateDriverFeedbackDto: UpdateDriverFeedbackDto,
  ): Promise<DriverFeedbackResponseDto> {
    const feedback = await this.driverFeedbackRepository.findOne({
      where: { id },
    });

    if (!feedback) {
      throw new NotFoundException('Driver feedback not found');
    }

    // Only the user who created the feedback can update it
    if (feedback.userId !== userId) {
      throw new UnauthorizedException(
        'You can only update your own feedbacks',
      );
    }

    // Update fields
    if (updateDriverFeedbackDto.rating !== undefined) {
      feedback.rating = updateDriverFeedbackDto.rating;
    }

    if (updateDriverFeedbackDto.feedback !== undefined) {
      feedback.feedback = updateDriverFeedbackDto.feedback;
    }

    if (updateDriverFeedbackDto.isAnonymous !== undefined) {
      feedback.isAnonymous = updateDriverFeedbackDto.isAnonymous;
    }

    const updatedFeedback =
      await this.driverFeedbackRepository.save(feedback);
    return this.mapToResponseDto(updatedFeedback);
  }

  async remove(id: number, userId: number): Promise<void> {
    const feedback = await this.driverFeedbackRepository.findOne({
      where: { id },
    });

    if (!feedback) {
      throw new NotFoundException('Driver feedback not found');
    }

    // Only the user who created the feedback can delete it
    if (feedback.userId !== userId) {
      throw new UnauthorizedException(
        'You can only delete your own feedbacks',
      );
    }

    await this.driverFeedbackRepository.remove(feedback);
  }

  private mapToResponseDto(
    feedback: DriverFeedbackEntity,
  ): DriverFeedbackResponseDto {
    const response = new DriverFeedbackResponseDto();
    response.id = feedback.id;
    response.userId = feedback.userId;
    response.driverId = feedback.driverId;
    response.rating = feedback.rating;
    response.feedback = feedback.feedback;
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

    // Add driver details if available
    if (feedback.driver) {
      response.driver = {
        id: feedback.driver.id,
        name: feedback.driver.name,
      };
    }

    return response;
  }
}

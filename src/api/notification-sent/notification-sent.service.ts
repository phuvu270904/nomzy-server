import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotificationSentEntity,
  NotificationSentType,
} from './entities/notification-sent.entity';
import { CreateNotificationSentDto } from './dto/create-notification-sent.dto';
import { UpdateNotificationSentDto } from './dto/update-notification-sent.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class NotificationSentService {
  constructor(
    @InjectRepository(NotificationSentEntity)
    private readonly notificationSentRepository: Repository<NotificationSentEntity>,
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
  ) {}

  async create(
    createNotificationSentDto: CreateNotificationSentDto,
    adminUserId: number,
  ): Promise<NotificationSentEntity> {
    // Validation for sentToUserId based on sentType
    if (
      (createNotificationSentDto.sentType ===
        NotificationSentType.INDIVIDUAL_USER ||
        createNotificationSentDto.sentType ===
          NotificationSentType.INDIVIDUAL_RESTAURANT) &&
      !createNotificationSentDto.sentToUserId
    ) {
      throw new BadRequestException(
        'sentToUserId is required for individual user or restaurant',
      );
    }

    // For individual types, verify the target user exists
    if (createNotificationSentDto.sentToUserId) {
      const user = await this.usersService.findWithRoles(
        createNotificationSentDto.sentToUserId,
      );
      if (!user) {
        throw new NotFoundException(
          `User with ID ${createNotificationSentDto.sentToUserId} not found`,
        );
      }

      // For restaurant type, verify user is a restaurant
      if (
        createNotificationSentDto.sentType ===
          NotificationSentType.INDIVIDUAL_RESTAURANT &&
        user.role !== UserRole.OWNER
      ) {
        throw new BadRequestException(
          `User with ID ${createNotificationSentDto.sentToUserId} is not a restaurant owner`,
        );
      }

      // For user type, verify user is not a restaurant
      if (
        createNotificationSentDto.sentType ===
          NotificationSentType.INDIVIDUAL_USER &&
        user.role === UserRole.OWNER
      ) {
        throw new BadRequestException(
          `User with ID ${createNotificationSentDto.sentToUserId} is a restaurant owner, not a regular user`,
        );
      }
    }

    // Create notification sent record with the notification content
    const notificationSent = this.notificationSentRepository.create({
      title: createNotificationSentDto.title,
      message: createNotificationSentDto.message,
      image: createNotificationSentDto.image,
      sentToUserId: createNotificationSentDto.sentToUserId,
      sentType: createNotificationSentDto.sentType,
    });

    const savedRecord =
      await this.notificationSentRepository.save(notificationSent);

    // Process the notification sending based on type
    // This will create individual notifications for each user
    await this.processNotificationSending(savedRecord, adminUserId);

    return savedRecord;
  }

  async findAll(): Promise<NotificationSentEntity[]> {
    return this.notificationSentRepository.find({
      relations: ['sentToUser'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<NotificationSentEntity> {
    const notificationSent = await this.notificationSentRepository.findOne({
      where: { id },
      relations: ['sentToUser'],
    });

    if (!notificationSent) {
      throw new NotFoundException(
        `Notification sent record with ID ${id} not found`,
      );
    }

    return notificationSent;
  }

  async update(
    id: number,
    updateNotificationSentDto: UpdateNotificationSentDto,
  ): Promise<NotificationSentEntity> {
    const notificationSent = await this.findOne(id);

    // Apply updates
    Object.assign(notificationSent, updateNotificationSentDto);

    return this.notificationSentRepository.save(notificationSent);
  }

  async remove(id: number): Promise<void> {
    const result = await this.notificationSentRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(
        `Notification sent record with ID ${id} not found`,
      );
    }
  }

  private async processNotificationSending(
    notificationSent: NotificationSentEntity,
    adminUserId: number,
  ): Promise<void> {
    switch (notificationSent.sentType) {
      case NotificationSentType.INDIVIDUAL_USER:
        await this.sendNotificationToUser(
          notificationSent.sentToUserId,
          notificationSent.title,
          notificationSent.message,
          notificationSent.image,
          adminUserId,
        );
        break;
      case NotificationSentType.INDIVIDUAL_RESTAURANT:
        await this.sendNotificationToUser(
          notificationSent.sentToUserId,
          notificationSent.title,
          notificationSent.message,
          notificationSent.image,
          adminUserId,
        );
        break;
      case NotificationSentType.ALL_USERS:
        await this.sendNotificationToAllUsers(
          notificationSent.title,
          notificationSent.message,
          notificationSent.image,
          adminUserId,
        );
        break;
      case NotificationSentType.ALL_RESTAURANTS:
        await this.sendNotificationToAllRestaurants(
          notificationSent.title,
          notificationSent.message,
          notificationSent.image,
          adminUserId,
        );
        break;
      default:
        throw new BadRequestException(
          `Invalid notification sent type: ${notificationSent.sentType}`,
        );
    }
  }

  private async sendNotificationToUser(
    userId: number,
    title: string,
    message: string,
    image: string,
    adminUserId: number,
  ): Promise<void> {
    // Create a notification for this specific user
    await this.notificationsService.create({
      title,
      message,
      image,
      userId: userId,
    });
  }

  private async sendNotificationToAllUsers(
    title: string,
    message: string,
    image: string,
    adminUserId: number,
  ): Promise<void> {
    const users = await this.usersService.findAllAccounts();

    for (const user of users) {
      await this.sendNotificationToUser(
        user.id,
        title,
        message,
        image,
        adminUserId,
      );
    }
  }

  private async sendNotificationToAllRestaurants(
    title: string,
    message: string,
    image: string,
    adminUserId: number,
  ): Promise<void> {
    const restaurants = await this.usersService.findAllRestaurants();

    for (const restaurant of restaurants) {
      await this.sendNotificationToUser(
        restaurant.id,
        title,
        message,
        image,
        adminUserId,
      );
    }
  }
}

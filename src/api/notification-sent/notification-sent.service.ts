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
import { UserNotificationsService } from '../user-notifications/user-notifications.service';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class NotificationSentService {
  constructor(
    @InjectRepository(NotificationSentEntity)
    private readonly notificationSentRepository: Repository<NotificationSentEntity>,
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
    private readonly userNotificationsService: UserNotificationsService,
  ) {}

  async create(
    createNotificationSentDto: CreateNotificationSentDto,
  ): Promise<NotificationSentEntity> {
    // Verify notification exists
    const notification = await this.notificationsService.findOne(
      createNotificationSentDto.notificationId,
    );

    if (!notification) {
      throw new NotFoundException(
        `Notification with ID ${createNotificationSentDto.notificationId} not found`,
      );
    }

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

    // Create record
    const notificationSent = this.notificationSentRepository.create({
      notificationId: createNotificationSentDto.notificationId,
      sentToUserId: createNotificationSentDto.sentToUserId,
      sentType: createNotificationSentDto.sentType,
    });

    const savedRecord =
      await this.notificationSentRepository.save(notificationSent);

    // Process the notification sending based on type
    await this.processNotificationSending(savedRecord);

    return savedRecord;
  }

  async findAll(): Promise<NotificationSentEntity[]> {
    return this.notificationSentRepository.find({
      relations: ['notification', 'sentToUser'],
    });
  }

  async findOne(id: number): Promise<NotificationSentEntity> {
    const notificationSent = await this.notificationSentRepository.findOne({
      where: { id },
      relations: ['notification', 'sentToUser'],
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
  ): Promise<void> {
    switch (notificationSent.sentType) {
      case NotificationSentType.INDIVIDUAL_USER:
        await this.sendNotificationToUser(
          notificationSent.notificationId,
          notificationSent.sentToUserId,
        );
        break;
      case NotificationSentType.INDIVIDUAL_RESTAURANT:
        await this.sendNotificationToUser(
          notificationSent.notificationId,
          notificationSent.sentToUserId,
        );
        break;
      case NotificationSentType.ALL_USERS:
        await this.sendNotificationToAllUsers(notificationSent.notificationId);
        break;
      case NotificationSentType.ALL_RESTAURANTS:
        await this.sendNotificationToAllRestaurants(
          notificationSent.notificationId,
        );
        break;
      default:
        throw new BadRequestException(
          `Invalid notification sent type: ${notificationSent.sentType}`,
        );
    }
  }

  private async sendNotificationToUser(
    notificationId: number,
    userId: number,
  ): Promise<void> {
    await this.userNotificationsService.create({
      userId,
      notificationId,
      isRead: false,
    });
  }

  private async sendNotificationToAllUsers(
    notificationId: number,
  ): Promise<void> {
    const users = await this.usersService.findAllUsers();

    for (const user of users) {
      await this.sendNotificationToUser(notificationId, user.id);
    }
  }

  private async sendNotificationToAllRestaurants(
    notificationId: number,
  ): Promise<void> {
    const restaurants = await this.usersService.findAllRestaurants();

    for (const restaurant of restaurants) {
      await this.sendNotificationToUser(notificationId, restaurant.id);
    }
  }
}

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { FCMService } from './services/fcm.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
    private readonly fcmService: FCMService,
    private readonly usersService: UsersService,
  ) {}

  async findAll(userId: number): Promise<NotificationEntity[]> {
    return this.notificationRepository.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<NotificationEntity> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<NotificationEntity> {
    const newNotification = this.notificationRepository.create(
      createNotificationDto,
    );
    const savedNotification = await this.notificationRepository.save(newNotification);

    // Send FCM notification to user if they have a token
    try {
      const user = await this.usersService.findOne(createNotificationDto.userId);
      
      if (user && user.fcm_token) {
        const fcmResult = await this.fcmService.sendToDevice(
          user.fcm_token,
          {
            title: createNotificationDto.title,
            message: createNotificationDto.message,
            imageUrl: createNotificationDto.image,
            data: {
              notificationId: savedNotification.id.toString(),
              userId: createNotificationDto.userId.toString(),
            },
          },
        );

        if (!fcmResult.success) {
          this.logger.warn(
            `Failed to send FCM notification to user ${user.id}: ${fcmResult.error}`,
          );

          // If token is invalid, remove it from the user
          if (fcmResult.error === 'INVALID_TOKEN') {
            this.logger.log(`Removing invalid FCM token for user ${user.id}`);
            await this.usersService.removeFcmToken(user.id);
          }
        } else {
          this.logger.log(
            `Successfully sent FCM notification to user ${user.id}`,
          );
        }
      }
    } catch (error) {
      // Log error but don't fail the notification creation
      this.logger.error(
        `Error sending FCM notification: ${error.message}`,
        error.stack,
      );
    }

    return savedNotification;
  }

  async update(
    id: number,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<NotificationEntity> {
    const notification = await this.findOne(id);

    const updatedNotification = Object.assign(
      notification,
      updateNotificationDto,
    );
    return this.notificationRepository.save(updatedNotification);
  }

  async remove(id: number): Promise<void> {
    const result = await this.notificationRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
  }
}

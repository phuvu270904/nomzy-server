import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
  ) {}

  async findAll(userId: number): Promise<NotificationEntity[]> {
    return this.notificationRepository.find({ where: { userId } });
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
    return this.notificationRepository.save(newNotification);
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

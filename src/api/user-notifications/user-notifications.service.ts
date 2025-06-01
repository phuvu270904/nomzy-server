import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserNotificationEntity } from './entities/user-notification.entity';
import { CreateUserNotificationDto } from './dto/create-user-notification.dto';
import { UpdateUserNotificationDto } from './dto/update-user-notification.dto';

@Injectable()
export class UserNotificationsService {
  constructor(
    @InjectRepository(UserNotificationEntity)
    private readonly userNotificationRepository: Repository<UserNotificationEntity>,
  ) {}

  async findAll(): Promise<UserNotificationEntity[]> {
    return this.userNotificationRepository.find({
      relations: ['user', 'notification'],
    });
  }

  async findByUserId(userId: number): Promise<UserNotificationEntity[]> {
    return this.userNotificationRepository.find({
      where: { userId },
      relations: ['notification'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<UserNotificationEntity> {
    const userNotification = await this.userNotificationRepository.findOne({
      where: { id },
      relations: ['user', 'notification'],
    });

    if (!userNotification) {
      throw new NotFoundException(`UserNotification with ID ${id} not found`);
    }

    return userNotification;
  }

  async create(
    createUserNotificationDto: CreateUserNotificationDto,
  ): Promise<UserNotificationEntity> {
    const newUserNotification = this.userNotificationRepository.create(
      createUserNotificationDto,
    );
    return this.userNotificationRepository.save(newUserNotification);
  }

  async update(
    id: number,
    updateUserNotificationDto: UpdateUserNotificationDto,
  ): Promise<UserNotificationEntity> {
    const userNotification = await this.findOne(id);

    const updatedUserNotification = Object.assign(
      userNotification,
      updateUserNotificationDto,
    );
    return this.userNotificationRepository.save(updatedUserNotification);
  }

  async markAsRead(id: number): Promise<UserNotificationEntity> {
    return this.update(id, { isRead: true });
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.userNotificationRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
  }

  async remove(id: number): Promise<void> {
    const result = await this.userNotificationRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`UserNotification with ID ${id} not found`);
    }
  }
}

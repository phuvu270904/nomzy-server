import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserNotificationSettingEntity } from './entities/user-notification-setting.entity';
import { CreateUserNotificationSettingDto } from './dto/create-user-notification-setting.dto';
import { UpdateUserNotificationSettingDto } from './dto/update-user-notification-setting.dto';

@Injectable()
export class UserNotificationSettingsService {
  constructor(
    @InjectRepository(UserNotificationSettingEntity)
    private readonly userNotificationSettingRepository: Repository<UserNotificationSettingEntity>,
  ) {}

  async create(
    createUserNotificationSettingDto: CreateUserNotificationSettingDto,
  ): Promise<UserNotificationSettingEntity> {
    const newSetting = this.userNotificationSettingRepository.create(
      createUserNotificationSettingDto,
    );
    return this.userNotificationSettingRepository.save(newSetting);
  }

  async findAll(): Promise<UserNotificationSettingEntity[]> {
    return this.userNotificationSettingRepository.find({
      relations: ['user'],
    });
  }

  async findOne(id: number): Promise<UserNotificationSettingEntity> {
    const setting = await this.userNotificationSettingRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!setting) {
      throw new NotFoundException(
        `User notification setting with ID ${id} not found`,
      );
    }

    return setting;
  }

  async findByUserId(userId: number): Promise<UserNotificationSettingEntity> {
    const setting = await this.userNotificationSettingRepository.findOne({
      where: { userId },
    });

    if (!setting) {
      throw new NotFoundException(
        `User notification setting for user with ID ${userId} not found`,
      );
    }

    return setting;
  }

  async findByUserIdOrCreate(
    userId: number,
  ): Promise<UserNotificationSettingEntity> {
    try {
      return await this.findByUserId(userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        // Create default settings for the user
        return this.create({
          userId,
          generalNotification: true,
          vibrate: true,
          specialOffers: true,
          promoAndDiscount: true,
          appUpdates: true,
        });
      }
      throw error;
    }
  }

  async update(
    id: number,
    updateUserNotificationSettingDto: UpdateUserNotificationSettingDto,
  ): Promise<UserNotificationSettingEntity> {
    const setting = await this.findOne(id);

    const updatedSetting = Object.assign(
      setting,
      updateUserNotificationSettingDto,
    );
    return this.userNotificationSettingRepository.save(updatedSetting);
  }

  async updateByUserId(
    userId: number,
    updateUserNotificationSettingDto: UpdateUserNotificationSettingDto,
  ): Promise<UserNotificationSettingEntity> {
    const setting = await this.findByUserIdOrCreate(userId);

    const updatedSetting = Object.assign(
      setting,
      updateUserNotificationSettingDto,
    );
    return this.userNotificationSettingRepository.save(updatedSetting);
  }

  async remove(id: number): Promise<void> {
    const result = await this.userNotificationSettingRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(
        `User notification setting with ID ${id} not found`,
      );
    }
  }
}

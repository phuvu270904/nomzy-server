import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserNotificationSettingsController } from './user-notification-settings.controller';
import { UserNotificationSettingsService } from './user-notification-settings.service';
import { UserNotificationSettingEntity } from './entities/user-notification-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserNotificationSettingEntity])],
  controllers: [UserNotificationSettingsController],
  providers: [UserNotificationSettingsService],
  exports: [UserNotificationSettingsService],
})
export class UserNotificationSettingsModule {}

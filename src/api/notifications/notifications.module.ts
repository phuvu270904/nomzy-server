import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationEntity } from './entities/notification.entity';
import { FCMService } from './services/fcm.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationEntity]), UsersModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, FCMService],
  exports: [NotificationsService],
})
export class NotificationsModule {}

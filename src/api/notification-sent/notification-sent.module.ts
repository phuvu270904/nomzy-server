import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationSentController } from './notification-sent.controller';
import { NotificationSentService } from './notification-sent.service';
import { NotificationSentEntity } from './entities/notification-sent.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
import { UserNotificationsModule } from '../user-notifications/user-notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationSentEntity]),
    NotificationsModule,
    UsersModule,
    UserNotificationsModule,
  ],
  controllers: [NotificationSentController],
  providers: [NotificationSentService],
  exports: [NotificationSentService],
})
export class NotificationSentModule {}

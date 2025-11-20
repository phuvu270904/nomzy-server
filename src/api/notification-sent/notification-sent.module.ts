import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationSentController } from './notification-sent.controller';
import { NotificationSentService } from './notification-sent.service';
import { NotificationSentEntity } from './entities/notification-sent.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationSentEntity]),
    NotificationsModule,
    UsersModule,
  ],
  controllers: [NotificationSentController],
  providers: [NotificationSentService],
  exports: [NotificationSentService],
})
export class NotificationSentModule {}

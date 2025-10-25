import { Module } from '@nestjs/common';
import { DriverFeedbacksService } from './driver-feedbacks.service';
import { DriverFeedbacksController } from './driver-feedbacks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriverFeedbackEntity } from './entities/driver-feedback.entity';
import { UserEntity } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DriverFeedbackEntity, UserEntity])],
  controllers: [DriverFeedbacksController],
  providers: [DriverFeedbacksService],
  exports: [DriverFeedbacksService],
})
export class DriverFeedbacksModule {}

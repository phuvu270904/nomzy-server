import { Module } from '@nestjs/common';
import { DriverReviewsService } from './driver-reviews.service';
import { DriverReviewsController } from './driver-reviews.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriverReviewEntity } from './entities/driver-review.entity';
import { UserEntity } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DriverReviewEntity, UserEntity])],
  controllers: [DriverReviewsController],
  providers: [DriverReviewsService],
  exports: [DriverReviewsService],
})
export class DriverReviewsModule {}

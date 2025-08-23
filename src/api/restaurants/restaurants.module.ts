import { Module } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { RestaurantsController } from './restaurants.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { FeedbacksService } from '../feedbacks/feedbacks.service';
import { FeedbacksModule } from '../feedbacks/feedbacks.module';
import { FeedbackEntity } from '../feedbacks/entities/feedback.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, FeedbackEntity])],
  controllers: [RestaurantsController],
  providers: [RestaurantsService, FeedbacksService],
  exports: [RestaurantsService],
})
export class RestaurantsModule {}

import { Module } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { RestaurantsController } from './restaurants.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { FeedbacksService } from '../feedbacks/feedbacks.service';
import { FeedbacksModule } from '../feedbacks/feedbacks.module';
import { FeedbackEntity } from '../feedbacks/entities/feedback.entity';
import { FavoriteEntity } from '../favorites/entities/favorite.entity';
import { FavoritesService } from '../favorites/favorites.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, FeedbackEntity, FavoriteEntity]),
  ],
  controllers: [RestaurantsController],
  providers: [RestaurantsService, FeedbacksService, FavoritesService],
  exports: [RestaurantsService],
})
export class RestaurantsModule {}

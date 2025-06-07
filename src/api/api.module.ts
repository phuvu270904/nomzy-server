import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UserNotificationsModule } from './user-notifications/user-notifications.module';
import { OffersModule } from './offers/offers.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { CartsModule } from './carts/carts.module';
import { AboutModule } from './about/about.module';
import { FeedbacksModule } from './feedbacks/feedbacks.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    NotificationsModule,
    UserNotificationsModule,
    OffersModule,
    RestaurantsModule,
    CartsModule,
    AboutModule,
    FeedbacksModule,
  ],
})
export class ApiModule {}

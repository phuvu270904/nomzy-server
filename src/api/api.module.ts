import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { NotificationsModule } from './notifications/notifications.module';
import { NotificationSentModule } from './notification-sent/notification-sent.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { CartsModule } from './carts/carts.module';
import { FeedbacksModule } from './feedbacks/feedbacks.module';
import { AddressesModule } from './addresses/addresses.module';
import { CouponsModule } from './coupons/coupons.module';
import { RestaurantCouponsModule } from './restaurant-coupons/restaurant-coupons.module';
import { UserCouponsModule } from './user-coupons/user-coupons.module';
import { CouponSentModule } from './coupon-sent/coupon-sent.module';
import { DriverReviewsModule } from './driver-reviews/driver-reviews.module';
import { FavoritesModule } from './favorites/favorites.module';
import { FaqsModule } from './faqs/faqs.module';
import { OrdersModule } from './orders/orders.module';
import { ConversationsModule } from './conversations/conversations.module';
import { UserVehiclesModule } from './user-vehicles/user-vehicles.module';
import { AiSuggestModule } from './ai-suggest/ai-suggest.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    NotificationsModule,
    NotificationSentModule,
    RestaurantsModule,
    CartsModule,
    FeedbacksModule,
    AddressesModule,
    CouponsModule,
    RestaurantCouponsModule,
    UserCouponsModule,
    CouponSentModule,
    DriverReviewsModule,
    FavoritesModule,
    FaqsModule,
    OrdersModule,
    ConversationsModule,
    UserVehiclesModule,
    AiSuggestModule,
  ],
})
export class ApiModule {}

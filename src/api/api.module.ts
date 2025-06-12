import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UserNotificationsModule } from './user-notifications/user-notifications.module';
import { NotificationSentModule } from './notification-sent/notification-sent.module';
import { UserNotificationSettingsModule } from './user-notification-settings/user-notification-settings.module';
import { OffersModule } from './offers/offers.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { CartsModule } from './carts/carts.module';
import { AboutModule } from './about/about.module';
import { FeedbacksModule } from './feedbacks/feedbacks.module';
import { AddressesModule } from './addresses/addresses.module';
import { CouponsModule } from './coupons/coupons.module';
import { RestaurantCouponsModule } from './restaurant-coupons/restaurant-coupons.module';
import { UserCouponsModule } from './user-coupons/user-coupons.module';
import { CouponSentModule } from './coupon-sent/coupon-sent.module';
import { DriverReviewsModule } from './driver-reviews/driver-reviews.module';
import { FavoritesModule } from './favorites/favorites.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    NotificationsModule,
    UserNotificationsModule,
    NotificationSentModule,
    UserNotificationSettingsModule,
    OffersModule,
    RestaurantsModule,
    CartsModule,
    AboutModule,
    FeedbacksModule,
    AddressesModule,
    CouponsModule,
    RestaurantCouponsModule,
    UserCouponsModule,
    CouponSentModule,
    DriverReviewsModule,
    FavoritesModule,
  ],
})
export class ApiModule {}

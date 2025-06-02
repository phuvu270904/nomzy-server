import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UserNotificationsModule } from './user-notifications/user-notifications.module';
import { OffersModule } from './offers/offers.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    NotificationsModule,
    UserNotificationsModule,
    OffersModule,
  ],
})
export class ApiModule {}

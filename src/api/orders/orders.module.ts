import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrdersGateway } from './orders.gateway';
import { WebSocketIntegrationService } from './websocket-integration.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './entities/order.entity';
import { OrderItemEntity } from './entities/order-item.entity';
import { CartsModule } from '../carts/carts.module';
import { AddressesModule } from '../addresses/addresses.module';
import { ProductsModule } from '../products/products.module';
import { UserEntity } from '../users/entities/user.entity';
import { CouponsModule } from '../coupons/coupons.module';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, OrderItemEntity, UserEntity]),
    CartsModule,
    AddressesModule,
    ProductsModule,
    CouponsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecret',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    WebSocketIntegrationService,
    {
      provide: OrdersGateway,
      useFactory: (jwtService: JwtService, ordersService: OrdersService) => {
        const gateway = new OrdersGateway(jwtService, ordersService);
        ordersService.setOrdersGateway(gateway);
        return gateway;
      },
      inject: [JwtService, OrdersService],
    },
  ],
  exports: [OrdersService, OrdersGateway, WebSocketIntegrationService],
})
export class OrdersModule {}

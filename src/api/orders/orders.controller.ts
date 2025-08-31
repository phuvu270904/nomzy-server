import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersGateway } from './orders.gateway';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderEntity } from './entities/order.entity';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly ordersGateway: OrdersGateway,
  ) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto): Promise<OrderEntity> {
    // Create the order
    const order = await this.ordersService.createOrder(createOrderDto);

    // Notify restaurant immediately via WebSocket
    await this.ordersGateway.notifyRestaurantNewOrder(
      order.restaurantId,
      order,
    );

    // Automatically confirm the order (as per requirements)
    const confirmedOrder = await this.ordersService.confirmOrder(order.id);

    // Start searching for drivers after 30 seconds to give restaurant time to prepare
    setTimeout(() => {
      void this.ordersGateway.searchForAvailableDriver(confirmedOrder.id);
    }, 30000);

    // Set timeout to cancel order if no driver found within 30 minutes
    setTimeout(
      () => {
        void this.ordersGateway.cancelOrderAfterTimeout(confirmedOrder.id);
      },
      30 * 60 * 1000,
    ); // 30 minutes

    return confirmedOrder;
  }

  @Get('restaurant/:restaurantId')
  async getRestaurantOrders(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
  ): Promise<OrderEntity[]> {
    return this.ordersService.getOrdersByRestaurant(restaurantId);
  }

  @Get('user/:userId')
  async getUserOrders(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<OrderEntity[]> {
    return this.ordersService.getOrdersByUser(userId);
  }

  @Get('driver/:driverId')
  async getDriverOrders(
    @Param('driverId', ParseIntPipe) driverId: number,
  ): Promise<OrderEntity[]> {
    return this.ordersService.getOrdersByDriver(driverId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<OrderEntity> {
    const order = await this.ordersService.findOrderById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<OrderEntity> {
    return this.ordersService.updateOrderStatus(
      id,
      updateOrderStatusDto.status,
      null,
    );
  }
}

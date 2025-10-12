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
  Query,
  Req,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersGateway } from './orders.gateway';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderEntity } from './entities/order.entity';
import { OrderType } from './dto/order-type.dto';
import { Roles } from '../../roles/roles.decorator';
import { Role } from '../../roles/role.enum';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';

@Controller('orders')
@ApiBearerAuth('access-token')
@ApiTags('Orders')
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
    }, 5000);

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

  // Current user orders by type
  @Get('my/orders')
  @Roles(Role.USER)
  @ApiOperation({
    summary: 'Get current user orders by type',
    description:
      'Get orders for the authenticated user. Optionally filter by type (active, completed, cancelled). If no type is provided, returns all orders.',
  })
  @ApiQuery({
    name: 'type',
    enum: OrderType,
    required: false,
    description:
      'Filter orders by type: active (pending, confirmed, preparing, ready for pickup, out for delivery), completed (delivered), cancelled (cancelled)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns user orders',
    type: [OrderEntity],
  })
  async getCurrentUserOrdersByType(
    @Req() req,
    @Query('type') type?: OrderType,
  ): Promise<OrderEntity[]> {
    if (type) {
      return this.ordersService.getOrdersByUserAndType(req.user.id, type);
    }
    return this.ordersService.getOrdersByUser(req.user.id);
  }

  // Current restaurant owner orders by type
  @Get('my/restaurant-orders')
  @Roles(Role.OWNER)
  @ApiOperation({
    summary: 'Get current restaurant owner orders by type',
    description:
      'Get orders for the authenticated restaurant owner. Optionally filter by type (active, completed, cancelled). If no type is provided, returns all orders.',
  })
  @ApiQuery({
    name: 'type',
    enum: OrderType,
    required: false,
    description:
      'Filter orders by type: active (pending, confirmed, preparing, ready for pickup, out for delivery), completed (delivered), cancelled (cancelled)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns restaurant orders',
    type: [OrderEntity],
  })
  async getCurrentOwnerOrdersByType(
    @Req() req,
    @Query('type') type?: OrderType,
  ): Promise<OrderEntity[]> {
    if (type) {
      return this.ordersService.getOrdersByRestaurantAndType(req.user.id, type);
    }
    return this.ordersService.getOrdersByRestaurant(req.user.id);
  }

  // Current driver orders by type
  @Get('my/driver-orders')
  @Roles(Role.DRIVER)
  @ApiOperation({
    summary: 'Get current driver orders by type',
    description:
      'Get orders for the authenticated driver. Optionally filter by type (active, completed, cancelled). If no type is provided, returns all orders.',
  })
  @ApiQuery({
    name: 'type',
    enum: OrderType,
    required: false,
    description:
      'Filter orders by type: active (pending, confirmed, preparing, ready for pickup, out for delivery), completed (delivered), cancelled (cancelled)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns driver orders',
    type: [OrderEntity],
  })
  async getCurrentDriverOrdersByType(
    @Req() req,
    @Query('type') type?: OrderType,
  ): Promise<OrderEntity[]> {
    if (type) {
      return this.ordersService.getOrdersByDriverAndType(req.user.id, type);
    }
    return this.ordersService.getOrdersByDriver(req.user.id);
  }
}

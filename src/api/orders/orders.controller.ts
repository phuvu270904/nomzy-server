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
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@Controller('orders')
@ApiBearerAuth('access-token')
@ApiTags('Orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly ordersGateway: OrdersGateway,
  ) {}

  @ApiOperation({
    summary: 'Create new order',
    description: 'Create a new order with order items, delivery address, and payment method. The order is automatically confirmed and driver search begins after 5 seconds. If no driver is found within 30 minutes, the order is automatically cancelled.'
  })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({
    status: 201,
    description: 'Order created and confirmed successfully. WebSocket notifications sent to restaurant and order room.',
    type: OrderEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid order data, items, or addresses'
  })
  @ApiResponse({
    status: 404,
    description: 'User, restaurant, address, or products not found'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token'
  })
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

    // Notify everyone in the order room about the confirmation
    const roomName = `order_${confirmedOrder.id}`;
    this.ordersGateway.server.to(roomName).emit('order-status-updated', {
      orderId: confirmedOrder.id,
      status: confirmedOrder.status,
      updatedBy: 'system',
      updatedAt: new Date(),
      order: confirmedOrder,
    });

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

  @ApiOperation({
    summary: 'Get orders by restaurant ID',
    description: 'Retrieve all orders for a specific restaurant by restaurant ID. Includes order items, customer details, and delivery information.'
  })
  @ApiParam({
    name: 'restaurantId',
    type: 'number',
    description: 'Restaurant ID',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'List of restaurant orders retrieved successfully',
    type: [OrderEntity],
  })
  @ApiResponse({
    status: 404,
    description: 'Restaurant not found'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token'
  })
  @Get('restaurant/:restaurantId')
  async getRestaurantOrders(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
  ): Promise<OrderEntity[]> {
    return this.ordersService.getOrdersByRestaurant(restaurantId);
  }

  @ApiOperation({
    summary: 'Get orders by user ID',
    description: 'Retrieve all orders placed by a specific user by user ID. Includes order history with all statuses.'
  })
  @ApiParam({
    name: 'userId',
    type: 'number',
    description: 'User ID',
    example: 5
  })
  @ApiResponse({
    status: 200,
    description: 'List of user orders retrieved successfully',
    type: [OrderEntity],
  })
  @ApiResponse({
    status: 404,
    description: 'User not found'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token'
  })
  @Get('user/:userId')
  async getUserOrders(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<OrderEntity[]> {
    return this.ordersService.getOrdersByUser(userId);
  }

  @ApiOperation({
    summary: 'Get orders by driver ID',
    description: 'Retrieve all orders assigned to a specific driver by driver ID. Includes both completed and active deliveries.'
  })
  @ApiParam({
    name: 'driverId',
    type: 'number',
    description: 'Driver ID',
    example: 3
  })
  @ApiResponse({
    status: 200,
    description: 'List of driver orders retrieved successfully',
    type: [OrderEntity],
  })
  @ApiResponse({
    status: 404,
    description: 'Driver not found'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token'
  })
  @Get('driver/:driverId')
  async getDriverOrders(
    @Param('driverId', ParseIntPipe) driverId: number,
  ): Promise<OrderEntity[]> {
    return this.ordersService.getOrdersByDriver(driverId);
  }

  @ApiOperation({
    summary: 'Get order by ID',
    description: 'Retrieve detailed information about a specific order by its ID. Includes order items, customer, restaurant, driver, and delivery details.'
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Order ID',
    example: 123
  })
  @ApiResponse({
    status: 200,
    description: 'Order found and retrieved successfully',
    type: OrderEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token'
  })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<OrderEntity> {
    const order = await this.ordersService.findOrderById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  @ApiOperation({
    summary: 'Update order status',
    description: 'Update the status of an order. Status flow: pending → confirmed → preparing → ready_for_pickup → out_for_delivery → delivered. Can also be cancelled at any stage. WebSocket notifications are sent on status updates.'
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Order ID to update',
    example: 123
  })
  @ApiBody({ type: UpdateOrderStatusDto })
  @ApiResponse({
    status: 200,
    description: 'Order status updated successfully',
    type: OrderEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid status transition'
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token'
  })
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

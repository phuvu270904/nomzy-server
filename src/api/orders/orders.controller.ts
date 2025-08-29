import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OrderEntity, OrderStatus } from './entities/order.entity';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/role.enum';
import { WebSocketIntegrationService } from './websocket-integration.service';

@ApiTags('Orders')
@ApiBearerAuth('access-token')
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly webSocketIntegration: WebSocketIntegrationService,
  ) {}

  @Post()
  @Roles(Role.USER)
  @ApiOperation({ summary: 'Create a new order from cart items' })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    type: OrderEntity,
  })
  async create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    const order = await this.ordersService.create(req.user.id, createOrderDto);
    return order;
  }

  @Get()
  @Roles(Role.USER)
  @ApiOperation({ summary: 'Get all orders for current user' })
  @ApiResponse({
    status: 200,
    description: 'Returns all orders for the current user',
    type: [OrderEntity],
  })
  findAll(@Request() req) {
    return this.ordersService.findAll(req.user.id);
  }

  @Get(':id')
  @Roles(Role.USER)
  @ApiOperation({ summary: 'Get order by ID for current user' })
  @ApiParam({ name: 'id', description: 'Order ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Returns the order details',
    type: OrderEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(req.user.id, id);
  }

  @Patch(':id')
  @Roles(Role.USER)
  @ApiOperation({ summary: 'Update an order' })
  @ApiParam({ name: 'id', description: 'Order ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Order updated successfully',
    type: OrderEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(req.user.id, id, updateOrderDto);
  }

  @Delete(':id/cancel')
  @Roles(Role.USER)
  @ApiOperation({ summary: 'Cancel an order' })
  @ApiParam({ name: 'id', description: 'Order ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Order cancelled successfully',
    type: OrderEntity,
  })
  @ApiResponse({
    status: 400,
    description:
      'Cannot cancel order that is already being prepared or delivered',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  @HttpCode(HttpStatus.OK)
  cancel(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.ordersService.cancel(req.user.id, id);
  }

  // Restaurant owner endpoints
  @Get('restaurant/all')
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Get all orders for the restaurant' })
  @ApiResponse({
    status: 200,
    description: 'Returns all orders for the restaurant',
    type: [OrderEntity],
  })
  findAllForRestaurant(@Request() req) {
    return this.ordersService.findAllForRestaurant(req.user.id);
  }

  @Patch('restaurant/:id/status')
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Update order status as restaurant' })
  @ApiParam({ name: 'id', description: 'Order ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Order status updated successfully',
    type: OrderEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  updateOrderStatus(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: { status: OrderStatus },
  ) {
    return this.ordersService.updateOrderStatusWithRole(
      id,
      updateOrderDto.status,
      req.user.id,
      req.user.role,
    );
  }

  @Patch('restaurant/:id/assign-driver/:driverId')
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Assign driver to an order' })
  @ApiParam({ name: 'id', description: 'Order ID', type: 'number' })
  @ApiParam({ name: 'driverId', description: 'Driver ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Driver assigned successfully',
    type: OrderEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Order or driver not found',
  })
  assignDriverToOrder(
    @Request() req,
    @Param('id', ParseIntPipe) orderId: number,
    @Param('driverId', ParseIntPipe) driverId: number,
  ) {
    return this.ordersService.assignDriverToOrderSimple(orderId, driverId);
  }

  // Driver endpoints
  @Get('driver/assigned')
  @Roles(Role.DRIVER)
  @ApiOperation({ summary: 'Get all orders assigned to the driver' })
  @ApiResponse({
    status: 200,
    description: 'Returns all orders assigned to the driver',
    type: [OrderEntity],
  })
  findAllForDriver(@Request() req) {
    return this.ordersService.findAllForDriver(req.user.id);
  }

  @Patch('driver/:id/status')
  @Roles(Role.DRIVER)
  @ApiOperation({ summary: 'Update delivery status as driver' })
  @ApiParam({ name: 'id', description: 'Order ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Delivery status updated successfully',
    type: OrderEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid status update for driver',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  updateDeliveryStatus(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: { status: OrderStatus },
  ) {
    return this.ordersService.updateOrderStatusWithRole(
      id,
      updateOrderDto.status,
      req.user.id,
      req.user.role,
    );
  }
}

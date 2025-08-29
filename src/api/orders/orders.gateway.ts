import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OrdersService } from './orders.service';
import { OrderEntity, OrderStatus } from './entities/order.entity';
import { UserRole } from '../users/entities/user.entity';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

interface AuthenticatedSocket extends Socket {
  userId: number;
  userRole: UserRole;
  restaurantId?: number;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  namespace: '/orders',
})
export class OrdersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(OrdersGateway.name);
  private connectedClients = new Map<string, AuthenticatedSocket>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly ordersService: OrdersService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        this.logger.warn('Client attempted to connect without token');
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token);
      const authenticatedClient = client as AuthenticatedSocket;

      authenticatedClient.userId = payload.sub;
      authenticatedClient.userRole = payload.role;

      if (payload.role === UserRole.OWNER) {
        authenticatedClient.restaurantId = payload.sub;
      }

      this.connectedClients.set(client.id, authenticatedClient);

      // Join appropriate rooms based on user role
      await this.joinUserRooms(authenticatedClient);

      this.logger.log(
        `Client connected: ${client.id}, User: ${payload.sub}, Role: ${payload.role}`,
      );
    } catch (error) {
      this.logger.error('Invalid token provided', error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  private async joinUserRooms(client: AuthenticatedSocket) {
    switch (client.userRole) {
      case UserRole.USER:
        // Users join their personal room to receive order updates
        await client.join(`user-${client.userId}`);
        break;

      case UserRole.OWNER:
        // Restaurants join their restaurant room to receive new orders
        await client.join(`restaurant-${client.restaurantId}`);
        break;

      case UserRole.DRIVER:
        // Drivers join the drivers pool to receive available orders
        await client.join('drivers-pool');
        await client.join(`driver-${client.userId}`);
        break;
    }
  }

  // Event: Restaurant updates order status
  @SubscribeMessage('update-order-status')
  async handleUpdateOrderStatus(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: UpdateOrderStatusDto,
  ) {
    try {
      if (
        client.userRole !== UserRole.OWNER &&
        client.userRole !== UserRole.DRIVER
      ) {
        client.emit('error', {
          message: 'Unauthorized to update order status',
        });
        return;
      }

      const order = await this.ordersService.updateOrderStatusWithRole(
        data.orderId,
        data.status,
        client.userId,
        client.userRole,
      );

      // Emit order update to all relevant parties
      await this.broadcastOrderUpdate(order);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  // Event: Driver accepts an order
  @SubscribeMessage('accept-order')
  async handleAcceptOrder(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { orderId: number },
  ) {
    try {
      if (client.userRole !== UserRole.DRIVER) {
        client.emit('error', { message: 'Only drivers can accept orders' });
        return;
      }

      const order = await this.ordersService.assignDriverToOrderSimple(
        data.orderId,
        client.userId,
      );

      // Join the specific order room for real-time updates
      await client.join(`order-${data.orderId}`);

      // Remove order from drivers pool (no longer available)
      this.server
        .to('drivers-pool')
        .emit('order-taken', { orderId: data.orderId });

      // Notify all relevant parties about the driver assignment
      await this.broadcastOrderUpdate(order);

      client.emit('order-accepted', { order });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  // Event: Get available orders for drivers
  @SubscribeMessage('get-available-orders')
  async handleGetAvailableOrders(
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (client.userRole !== UserRole.DRIVER) {
        client.emit('error', {
          message: 'Only drivers can request available orders',
        });
        return;
      }

      const availableOrders =
        await this.ordersService.getAvailableOrdersForDrivers();
      client.emit('available-orders', { orders: availableOrders });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  // Event: Get restaurant orders
  @SubscribeMessage('get-restaurant-orders')
  async handleGetRestaurantOrders(
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (client.userRole !== UserRole.OWNER) {
        client.emit('error', {
          message: 'Only restaurants can request their orders',
        });
        return;
      }

      if (!client.restaurantId) {
        client.emit('error', {
          message: 'Restaurant ID not found',
        });
        return;
      }

      const orders = await this.ordersService.getRestaurantOrders(
        client.restaurantId,
      );
      client.emit('restaurant-orders', { orders });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  // Public method to be called when a new order is created
  async notifyNewOrder(order: OrderEntity) {
    // Notify the user who placed the order
    this.server.to(`user-${order.userId}`).emit('order-created', { order });

    // Notify the restaurant about the new order
    this.server
      .to(`restaurant-${order.restaurantId}`)
      .emit('new-order', { order });

    this.logger.log(
      `New order ${order.id} broadcasted to user ${order.userId} and restaurant ${order.restaurantId}`,
    );
  }

  // Public method to broadcast order updates
  async broadcastOrderUpdate(order: OrderEntity) {
    // Notify the user about order status change
    this.server.to(`user-${order.userId}`).emit('order-updated', { order });

    // Notify the restaurant about order status change
    this.server
      .to(`restaurant-${order.restaurantId}`)
      .emit('order-updated', { order });

    // If order is ready for pickup, notify all available drivers
    if (order.status === OrderStatus.READY_FOR_PICKUP && !order.driverId) {
      this.server.to('drivers-pool').emit('new-available-order', { order });
    }

    // If there's a driver assigned, notify them specifically
    if (order.driverId) {
      this.server
        .to(`driver-${order.driverId}`)
        .emit('order-updated', { order });
      this.server.to(`order-${order.id}`).emit('order-updated', { order });
    }

    this.logger.log(`Order ${order.id} update broadcasted to relevant parties`);
  }

  // Public method to notify driver about order assignment
  async notifyDriverAssignment(order: OrderEntity) {
    if (order.driverId) {
      this.server
        .to(`driver-${order.driverId}`)
        .emit('order-assigned', { order });
    }
  }
}

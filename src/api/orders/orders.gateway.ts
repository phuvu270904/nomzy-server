import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrderEntity, OrderStatus } from './entities/order.entity';

interface AuthenticatedSocket extends Socket {
  user?: {
    id: number;
    role: string;
    email: string;
  };
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/orders',
})
export class OrdersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(OrdersGateway.name);
  private connectedUsers = new Map<number, string>(); // userId -> socketId
  private driverSockets = new Map<number, string>(); // driverId -> socketId
  private restaurantSockets = new Map<number, string>(); // restaurantId -> socketId
  private declinedDrivers = new Map<number, Set<number>>(); // orderId -> Set<driverId>

  constructor(private readonly ordersService: OrdersService) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // In a real application, you'd validate the JWT token here
      // For now, we'll assume the user info is passed in the handshake
      const userId = parseInt(client.handshake.query.userId as string);
      const userRole = client.handshake.query.role as string;

      if (!userId || !userRole) {
        client.disconnect();
        return;
      }

      client.user = { id: userId, role: userRole, email: '' };
      this.connectedUsers.set(userId, client.id);

      // Track different types of users
      if (userRole === 'driver') {
        this.driverSockets.set(userId, client.id);
        this.logger.log(`Driver ${userId} connected`);
      } else if (userRole === 'owner') {
        this.restaurantSockets.set(userId, client.id);
        this.logger.log(`Restaurant owner ${userId} connected`);
      }

      this.logger.log(`User ${userId} with role ${userRole} connected`);
    } catch (error) {
      this.logger.error('Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.user) {
      const userId = client.user.id;
      this.connectedUsers.delete(userId);
      this.driverSockets.delete(userId);
      this.restaurantSockets.delete(userId);
      this.logger.log(`User ${userId} disconnected`);
    }
  }

  // Join order room (called when order is created or driver accepts)
  @SubscribeMessage('join-order-room')
  async handleJoinOrderRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { orderId: number },
  ) {
    const roomName = `order_${data.orderId}`;
    await client.join(roomName);
    this.logger.log(`User ${client.user?.id} joined room ${roomName}`);
    
    client.emit('joined-order-room', { orderId: data.orderId });
  }

  // Update order status (called by driver or restaurant)
  @SubscribeMessage('update-order-status')
  async handleUpdateOrderStatus(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    data: {
      orderId: number;
      status: OrderStatus;
      location?: { lat: number; lng: number };
    },
  ) {
    try {
      const order = await this.ordersService.updateOrderStatus(
        data.orderId,
        data.status,
        client.user!.id,
      );

      // Clean up declined drivers tracking for final states
      if (
        data.status === OrderStatus.DELIVERED ||
        data.status === OrderStatus.CANCELLED
      ) {
        this.cleanupOrderTracking(data.orderId);
      }

      // Broadcast status update to all users in the order room
      const roomName = `order_${data.orderId}`;
      this.server.to(roomName).emit('order-status-updated', {
        orderId: data.orderId,
        status: data.status,
        updatedBy: client.user!.id,
        updatedAt: new Date(),
        order: order,
        location: data.location,
      });

      this.logger.log(
        `Order ${data.orderId} status updated to ${data.status} by user ${client.user!.id}`,
      );
    } catch (error) {
      this.logger.error('Error updating order status:', error);
      client.emit('error', { message: 'Failed to update order status' });
    }
  }

  // Driver accepts order
  @SubscribeMessage('driver-accept-order')
  async handleDriverAcceptOrder(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { orderId: number, location?: { latitude: number; longitude: number } },
  ) {
    try {
      if (client.user?.role !== 'driver') {
        client.emit('error', { message: 'Only drivers can accept orders' });
        return;
      }

      const order = await this.ordersService.assignDriverToOrder(
        data.orderId,
        client.user.id,
      );

      // Join the order room
      const roomName = `order_${data.orderId}`;
      await client.join(roomName);

      // Clear declined drivers for this order since it's now assigned
      this.declinedDrivers.delete(data.orderId);

      // Notify all parties in the order room
      this.server.to(roomName).emit('driver-assigned', {
        orderId: data.orderId,
        driverId: client.user.id,
        order: order,
        location: data.location,
      });

      this.logger.log(
        `Driver ${client.user.id} accepted order ${data.orderId}`,
      );
    } catch (error) {
      this.logger.error('Error accepting order:', error);
      client.emit('error', { message: 'Failed to accept order' });
    }
  }

  // Driver declines order
  @SubscribeMessage('driver-decline-order')
  async handleDriverDeclineOrder(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { orderId: number },
  ) {
    try {
      if (client.user?.role !== 'driver') {
        client.emit('error', { message: 'Only drivers can decline orders' });
        return;
      }

      // Track declined driver for this order
      if (!this.declinedDrivers.has(data.orderId)) {
        this.declinedDrivers.set(data.orderId, new Set());
      }
      this.declinedDrivers.get(data.orderId)!.add(client.user.id);

      // Continue searching for other drivers
      this.searchForAvailableDriver(data.orderId);

      this.logger.log(
        `Driver ${client.user.id} declined order ${data.orderId}`,
      );
      client.emit('order-declined', { orderId: data.orderId });
    } catch (error) {
      this.logger.error('Error declining order:', error);
    }
  }

  // Driver updates their location (called by driver during delivery)
  @SubscribeMessage('driver-location-update')
  async handleDriverLocationUpdate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    data: {
      orderId: number;
      location: { latitude: number; longitude: number };
    },
  ) {
    try {
      if (client.user?.role !== 'driver') {
        client.emit('error', {
          message: 'Only drivers can update their location',
        });
        return;
      }

      // Broadcast location update to all users in the order room
      const roomName = `order_${data.orderId}`;
      this.server.to(roomName).emit('driver-location-update', {
        orderId: data.orderId,
        driverId: client.user.id,
        location: data.location,
        timestamp: new Date(),
      });

      this.logger.debug(
        `Driver ${client.user.id} location updated for order ${data.orderId}: ${data.location.latitude}, ${data.location.longitude}`,
      );
    } catch (error) {
      this.logger.error('Error updating driver location:', error);
      client.emit('error', { message: 'Failed to update location' });
    }
  }

  // Methods to be called from the service
  async notifyRestaurantNewOrder(restaurantId: number, order: OrderEntity) {
    if (!this.server) {
      this.logger.warn('WebSocket server not initialized yet, cannot notify restaurant');
      return;
    }

    const restaurantSocketId = this.restaurantSockets.get(restaurantId);
    if (restaurantSocketId) {
      this.server.to(restaurantSocketId).emit('new-order', {
        order: order,
        message: 'New order received!',
      });
      this.logger.log(`Notified restaurant ${restaurantId} about new order ${order.id}`);
    } else {
      this.logger.warn(`Restaurant ${restaurantId} is not connected via WebSocket`);
    }

    // Also add restaurant to the order room
    const roomName = `order_${order.id}`;
    if (restaurantSocketId && this.server.sockets?.sockets) {
      console.log("aaaaaaa");
      
      const restaurantSocket = this.server.sockets.sockets.get(restaurantSocketId);
      if (restaurantSocket) {
        console.log("aaaaaa 2");
        
        await restaurantSocket.join(roomName);
        this.logger.log(`Restaurant ${restaurantId} joined room ${roomName}`);
      }
    }
  }

  async notifyDriverOrderRequest(driverId: number, order: OrderEntity) {
    if (!this.server) {
      this.logger.warn('WebSocket server not initialized yet, cannot notify driver');
      return;
    }

    const driverSocketId = this.driverSockets.get(driverId);
    if (driverSocketId) {
      this.server.to(driverSocketId).emit('order-request', {
        order: order,
        message: 'New delivery request!',
      });
      this.logger.log(`Notified driver ${driverId} about order ${order.id}`);
    } else {
      this.logger.warn(`Driver ${driverId} is not connected via WebSocket`);
    }
  }

  async searchForAvailableDriver(orderId: number) {
    try {
      const availableDrivers =
        await this.ordersService.findAvailableDrivers(orderId);

      if (availableDrivers.length === 0) {
        this.logger.warn(`No available drivers found for order ${orderId}`);
        return;
      }

      // Filter out drivers who have already declined this order
      const declinedDriverIds = this.declinedDrivers.get(orderId) || new Set();
      const eligibleDrivers = availableDrivers.filter(
        (driver) => !declinedDriverIds.has(driver.id),
      );

      if (eligibleDrivers.length === 0) {
        this.logger.warn(
          `No eligible drivers left for order ${orderId} (all have declined)`,
        );
        // Consider cancelling the order or implementing fallback logic
        setTimeout(
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          async () => {
            await this.cancelOrderAfterTimeout(orderId);
          },
          5 * 60 * 1000,
        ); // Cancel after 5 minutes if no drivers left
        return;
      }

      // Get the order details
      const order = await this.ordersService.findOrderById(orderId);
      if (!order) {
        this.logger.error(`Order ${orderId} not found`);
        return;
      }

      // Notify the first eligible driver
      const firstDriver = eligibleDrivers[0];
      await this.notifyDriverOrderRequest(firstDriver.id, order);

      // Set timeout to search for next driver if no response
      setTimeout(
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        async () => {
          const updatedOrder = await this.ordersService.findOrderById(orderId);
          if (
            updatedOrder &&
            !updatedOrder.driverId &&
            updatedOrder.status === OrderStatus.CONFIRMED
          ) {
            this.logger.log(
              `No response from driver ${firstDriver.id}, trying next driver`,
            );
            // Try next available driver
            this.searchForAvailableDriver(orderId);
          }
        },
        5 * 60 * 1000,
      ); // 5 minutes timeout per driver
    } catch (error) {
      this.logger.error('Error searching for drivers:', error);
    }
  }

  async cancelOrderAfterTimeout(orderId: number) {
    try {
      const order = await this.ordersService.findOrderById(orderId);
      if (order && !order.driverId && order.status === OrderStatus.CONFIRMED) {
        await this.ordersService.updateOrderStatus(
          orderId,
          OrderStatus.CANCELLED,
          null,
        );

        // Notify all parties in the order room
        const roomName = `order_${orderId}`;
        this.server.to(roomName).emit('order-cancelled', {
          orderId: orderId,
          reason: 'No driver found within 30 minutes',
          cancelledAt: new Date(),
        });

        // Clean up declined drivers for this order
        this.declinedDrivers.delete(orderId);

        this.logger.log(`Order ${orderId} cancelled due to timeout`);
      }
    } catch (error) {
      this.logger.error('Error cancelling order after timeout:', error);
    }
  }

  getOnlineDrivers(): number[] {
    return Array.from(this.driverSockets.keys());
  }

  isDriverOnline(driverId: number): boolean {
    return this.driverSockets.has(driverId);
  }

  // Clean up declined drivers tracking for completed/cancelled orders
  cleanupOrderTracking(orderId: number) {
    this.declinedDrivers.delete(orderId);
  }
}

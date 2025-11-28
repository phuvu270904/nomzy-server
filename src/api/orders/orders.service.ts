import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { OrderEntity, OrderStatus } from './entities/order.entity';
import { OrderItemEntity } from './entities/order-item.entity';
import { UserEntity, UserRole } from '../users/entities/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderType } from './dto/order-type.dto';
import { OrdersGateway } from './orders.gateway';
import { DriverReviewEntity } from '../driver-reviews/entities/driver-review.entity';
import { UserVehicleEntity } from '../user-vehicles/entities/user-vehicle.entity';

@Injectable()
export class OrdersService {
  constructor(
    @Inject(forwardRef(() => OrdersGateway))
    private readonly ordersGateway: OrdersGateway,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(DriverReviewEntity)
    private readonly driverReviewRepository: Repository<DriverReviewEntity>,
    @InjectRepository(UserVehicleEntity)
    private readonly userVehicleRepository: Repository<UserVehicleEntity>,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<OrderEntity> {
    const { userId, restaurantId, orderItems, addressId, ...orderData } =
      createOrderDto;

    // Validate user and restaurant exist
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const restaurant = await this.userRepository.findOne({
      where: { id: restaurantId, role: UserRole.OWNER },
    });
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    // Create order
    const order = this.orderRepository.create({
      ...orderData,
      userId,
      restaurantId,
      addressId,
      status: OrderStatus.PENDING,
    });

    const savedOrder = await this.orderRepository.save(order);

    // Create order items
    if (orderItems && orderItems.length > 0) {
      const orderItemsToCreate = orderItems.map((item) =>
        this.orderItemRepository.create({
          orderId: savedOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          subtotal: item.subtotal,
        }),
      );

      await this.orderItemRepository.save(orderItemsToCreate);
    }

    // Return order with items
    const orderWithItems = await this.findOrderById(savedOrder.id);
    if (!orderWithItems) {
      throw new NotFoundException('Failed to create order');
    }
    return orderWithItems;
  }

  async findOrderById(orderId: number): Promise<OrderEntity | null> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: [
        'user',
        'restaurant',
        'restaurant.addresses',
        'driver',
        'orderItems',
        'orderItems.product',
        'address',
      ],
    });

    if (order && order.driver) {
      order.driver = await this.enrichDriverData(order.driver);
    }

    return order;
  }

  async updateOrderStatus(
    orderId: number,
    status: OrderStatus,
    updatedBy: number | null,
  ): Promise<OrderEntity> {
    const order = await this.findOrderById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Validate status transition
    if (!this.isValidStatusTransition(order.status, status)) {
      throw new BadRequestException(
        `Cannot change status from ${order.status} to ${status}`,
      );
    }

    order.status = status;
    if (status === OrderStatus.DELIVERED) {
      order.deliveredAt = new Date();
    }

    const updatedOrder = await this.orderRepository.save(order);
    const orderWithRelations = await this.findOrderById(updatedOrder.id);
    if (!orderWithRelations) {
      throw new NotFoundException('Failed to update order');
    }
    return orderWithRelations;
  }

  async assignDriverToOrder(
    orderId: number,
    driverId: number,
  ): Promise<OrderEntity> {
    const order = await this.findOrderById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.driverId) {
      throw new BadRequestException('Order already has a driver assigned');
    }

    if (order.status !== OrderStatus.CONFIRMED) {
      throw new BadRequestException(
        'Order must be confirmed before assigning driver',
      );
    }

    // Validate driver exists and is available
    const driver = await this.userRepository.findOne({
      where: { id: driverId, role: UserRole.DRIVER },
    });
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    order.driverId = driverId;
    order.status = OrderStatus.PREPARING;

    const updatedOrder = await this.orderRepository.save(order);
    const orderWithRelations = await this.findOrderById(updatedOrder.id);
    if (!orderWithRelations) {
      throw new NotFoundException('Failed to assign driver');
    }

    // Enrich driver data with rating and plate number
    if (orderWithRelations.driver) {
      orderWithRelations.driver = await this.enrichDriverData(
        orderWithRelations.driver,
      );
    }

    const roomName = `order_${orderId}`;
    this.ordersGateway.server.to(roomName).emit('order-status-updated', {
      orderId,
      status: orderWithRelations.status,
      updatedBy: 'system',
      updatedAt: new Date(),
      order: orderWithRelations,
    });

    return orderWithRelations;
  }

  async findAvailableDrivers(orderId: number): Promise<UserEntity[]> {
    const order = await this.findOrderById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Get all drivers
    const drivers = await this.userRepository.find({
      where: { role: UserRole.DRIVER },
      relations: ['addresses'],
    });

    // Filter drivers who are not currently assigned to an active order
    const availableDrivers: UserEntity[] = [];
    for (const driver of drivers) {
      const activeOrder = await this.orderRepository.findOne({
        where: {
          driverId: driver.id,
          status: In([
            OrderStatus.PREPARING,
            OrderStatus.READY_FOR_PICKUP,
            OrderStatus.OUT_FOR_DELIVERY,
          ]),
        },
      });

      if (!activeOrder) {
        // Here you would calculate distance based on driver's location
        // For now, we'll add all available drivers
        availableDrivers.push(driver);
      }
    }

    return availableDrivers;
  }

  async confirmOrder(orderId: number): Promise<OrderEntity> {
    const order = await this.findOrderById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order cannot be confirmed');
    }

    order.status = OrderStatus.CONFIRMED;
    const updatedOrder = await this.orderRepository.save(order);
    const orderWithRelations = await this.findOrderById(updatedOrder.id);
    if (!orderWithRelations) {
      throw new NotFoundException('Failed to confirm order');
    }
    return orderWithRelations;
  }

  async getOrdersByRestaurant(restaurantId: number): Promise<OrderEntity[]> {
    const orders = await this.orderRepository.find({
      where: { restaurantId },
      relations: [
        'user',
        'driver',
        'orderItems',
        'orderItems.product',
        'orderItems.product.category',
        'address',
      ],
      order: { createdAt: 'DESC' },
    });

    // Enrich driver data for all orders
    for (const order of orders) {
      if (order.driver) {
        order.driver = await this.enrichDriverData(order.driver);
      }
    }

    return orders;
  }

  async getOrdersByUser(userId: number): Promise<OrderEntity[]> {
    const orders = await this.orderRepository.find({
      where: { userId },
      relations: [
        'restaurant',
        'driver',
        'orderItems',
        'orderItems.product',
        'address',
      ],
      order: { createdAt: 'DESC' },
    });

    // Enrich driver data for all orders
    for (const order of orders) {
      if (order.driver) {
        order.driver = await this.enrichDriverData(order.driver);
      }
    }

    return orders;
  }

  async getOrdersByDriver(driverId: number): Promise<OrderEntity[]> {
    const orders = await this.orderRepository.find({
      where: { driverId },
      relations: [
        'user',
        'restaurant',
        'orderItems',
        'orderItems.product',
        'address',
      ],
      order: { createdAt: 'DESC' },
    });

    // Enrich driver data for all orders
    for (const order of orders) {
      if (order.driver) {
        order.driver = await this.enrichDriverData(order.driver);
      }
    }

    return orders;
  }

  async getOrdersByUserAndType(
    userId: number,
    type: OrderType,
  ): Promise<OrderEntity[]> {
    const statusMap = this.getStatusesByType(type);

    const orders = await this.orderRepository.find({
      where: {
        userId,
        status: In(statusMap),
      },
      relations: [
        'restaurant',
        'driver',
        'orderItems',
        'orderItems.product',
        'address',
      ],
      order: { createdAt: 'DESC' },
    });

    // Enrich driver data for all orders
    for (const order of orders) {
      if (order.driver) {
        order.driver = await this.enrichDriverData(order.driver);
      }
    }

    return orders;
  }

  async getOrdersByRestaurantAndType(
    restaurantId: number,
    type: OrderType,
  ): Promise<OrderEntity[]> {
    const statusMap = this.getStatusesByType(type);

    const orders = await this.orderRepository.find({
      where: {
        restaurantId,
        status: In(statusMap),
      },
      relations: [
        'user',
        'driver',
        'orderItems',
        'orderItems.product',
        'address',
      ],
      order: { createdAt: 'DESC' },
    });

    // Enrich driver data for all orders
    for (const order of orders) {
      if (order.driver) {
        order.driver = await this.enrichDriverData(order.driver);
      }
    }

    return orders;
  }

  async getOrdersByDriverAndType(
    driverId: number,
    type: OrderType,
  ): Promise<OrderEntity[]> {
    const statusMap = this.getStatusesByType(type);

    const orders = await this.orderRepository.find({
      where: {
        driverId,
        status: In(statusMap),
      },
      relations: [
        'user',
        'restaurant',
        'orderItems',
        'orderItems.product',
        'address',
      ],
      order: { createdAt: 'DESC' },
    });

    // Enrich driver data for all orders
    for (const order of orders) {
      if (order.driver) {
        order.driver = await this.enrichDriverData(order.driver);
      }
    }

    return orders;
  }

  private getStatusesByType(type: OrderType): OrderStatus[] {
    switch (type) {
      case OrderType.ACTIVE:
        return [
          OrderStatus.PENDING,
          OrderStatus.CONFIRMED,
          OrderStatus.PREPARING,
          OrderStatus.READY_FOR_PICKUP,
          OrderStatus.OUT_FOR_DELIVERY,
        ];
      case OrderType.COMPLETED:
        return [OrderStatus.DELIVERED];
      case OrderType.CANCELLED:
        return [OrderStatus.CANCELLED];
      default:
        return [];
    }
  }

  private isValidStatusTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus,
  ): boolean {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      [OrderStatus.PREPARING]: [
        OrderStatus.READY_FOR_PICKUP,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.READY_FOR_PICKUP]: [
        OrderStatus.OUT_FOR_DELIVERY,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.OUT_FOR_DELIVERY]: [
        OrderStatus.DELIVERED,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  private async enrichDriverData(driver: UserEntity): Promise<any> {
    if (!driver) return null;

    // Calculate average rating
    const reviews = await this.driverReviewRepository.find({
      where: { driverId: driver.id },
    });

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        : 0;

    // Get plate number from user vehicle
    const vehicle = await this.userVehicleRepository.findOne({
      where: { userId: driver.id },
      order: { createdAt: 'DESC' }, // Get the most recent vehicle
    });

    return {
      ...driver,
      rating: parseFloat(averageRating.toFixed(2)),
      plateNumber: vehicle?.regNumber || null,
    };
  }
}

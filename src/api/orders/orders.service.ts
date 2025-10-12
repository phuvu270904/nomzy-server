import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { OrderEntity, OrderStatus } from './entities/order.entity';
import { OrderItemEntity } from './entities/order-item.entity';
import { UserEntity, UserRole } from '../users/entities/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderType } from './dto/order-type.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
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
    return this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['user', 'restaurant', 'driver', 'orderItems', 'address'],
    });
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
    return this.orderRepository.find({
      where: { restaurantId },
      relations: ['user', 'driver', 'orderItems', 'address'],
      order: { createdAt: 'DESC' },
    });
  }

  async getOrdersByUser(userId: number): Promise<OrderEntity[]> {
    return this.orderRepository.find({
      where: { userId },
      relations: ['restaurant', 'driver', 'orderItems', 'address'],
      order: { createdAt: 'DESC' },
    });
  }

  async getOrdersByDriver(driverId: number): Promise<OrderEntity[]> {
    return this.orderRepository.find({
      where: { driverId },
      relations: ['user', 'restaurant', 'orderItems', 'address'],
      order: { createdAt: 'DESC' },
    });
  }

  async getOrdersByUserAndType(
    userId: number,
    type: OrderType,
  ): Promise<OrderEntity[]> {
    const statusMap = this.getStatusesByType(type);

    return this.orderRepository.find({
      where: {
        userId,
        status: In(statusMap),
      },
      relations: ['restaurant', 'driver', 'orderItems', 'address'],
      order: { createdAt: 'DESC' },
    });
  }

  async getOrdersByRestaurantAndType(
    restaurantId: number,
    type: OrderType,
  ): Promise<OrderEntity[]> {
    const statusMap = this.getStatusesByType(type);

    return this.orderRepository.find({
      where: {
        restaurantId,
        status: In(statusMap),
      },
      relations: ['user', 'driver', 'orderItems', 'address'],
      order: { createdAt: 'DESC' },
    });
  }

  async getOrdersByDriverAndType(
    driverId: number,
    type: OrderType,
  ): Promise<OrderEntity[]> {
    const statusMap = this.getStatusesByType(type);

    return this.orderRepository.find({
      where: {
        driverId,
        status: In(statusMap),
      },
      relations: ['user', 'restaurant', 'orderItems', 'address'],
      order: { createdAt: 'DESC' },
    });
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
}

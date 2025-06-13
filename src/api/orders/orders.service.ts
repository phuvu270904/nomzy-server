import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  OrderEntity,
  OrderStatus,
  PaymentStatus,
} from './entities/order.entity';
import { OrderItemEntity } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CartsService } from '../carts/carts.service';
import { AddressesService } from '../addresses/addresses.service';
import { ProductsService } from '../products/products.service';
import { UserEntity, UserRole } from '../users/entities/user.entity';
import { CouponsService } from '../coupons/coupons.service';
import { CouponType } from '../coupons/entities/coupon.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly cartsService: CartsService,
    private readonly addressesService: AddressesService,
    private readonly productsService: ProductsService,
    private readonly couponsService: CouponsService,
  ) {}

  async create(
    userId: number,
    createOrderDto: CreateOrderDto,
  ): Promise<OrderEntity> {
    // Get the user's cart
    const cart = await this.cartsService.getCart(userId);

    // Check if cart is empty
    if (!cart.cartItems || cart.cartItems.length === 0) {
      throw new BadRequestException('Cart is empty. Cannot create order.');
    }

    // Validate address
    const address = await this.addressesService.findOne(
      userId,
      createOrderDto.addressId,
    );

    // Validate restaurant
    const restaurant = await this.userRepository.findOne({
      where: { id: createOrderDto.restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    let discount = 0;
    let total = 0;
    let subtotal = 0;
    cart.cartItems.forEach((item) => {
      subtotal += Number(item.price) * item.quantity;
    });

    // Set a default delivery fee (this could be calculated based on distance or restaurant policy)
    const deliveryFee = 5.0;

    if (createOrderDto.couponId) {
      const coupon = await this.couponsService.findOne(createOrderDto.couponId);
      if (coupon) {
        // Validate coupon
        if (coupon.isActive) {
          if (coupon.type === CouponType.PERCENTAGE) {
            discount = (subtotal * coupon.value) / 100;
          } else if (coupon.type === CouponType.FIXED) {
            discount = coupon.value;
          }
          // Increment usage count
          await this.couponsService.incrementUsageCount(coupon.id);
        } else {
          throw new BadRequestException('Invalid or inactive coupon');
        }
      } else {
        throw new NotFoundException('Coupon not found');
      }
    }
    // Calculate total
    total = subtotal + deliveryFee - discount;

    // Create a new order
    const order = this.orderRepository.create({
      userId,
      restaurantId: createOrderDto.restaurantId,
      addressId: address.id,
      subtotal,
      deliveryFee,
      discount,
      total,
      notes: createOrderDto.notes,
      paymentMethod: createOrderDto.paymentMethod,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      couponId: createOrderDto.couponId,
    });

    // Save the order first to get an order ID
    const savedOrder = await this.orderRepository.save(order);

    // Create order items from cart items
    const orderItems = cart.cartItems.map((cartItem) => {
      return this.orderItemRepository.create({
        orderId: savedOrder.id,
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        unitPrice: cartItem.price,
        subtotal: Number(cartItem.price) * cartItem.quantity,
      });
    });

    // Save all order items
    await this.orderItemRepository.save(orderItems);

    // Clear the cart after successful order creation
    await this.cartsService.clearCart(userId);

    // Return the completed order with items
    return this.findOne(userId, savedOrder.id);
  }

  async findAll(userId: number): Promise<OrderEntity[]> {
    return this.orderRepository.find({
      where: { userId },
      relations: ['orderItems', 'orderItems.product', 'address', 'restaurant'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(userId: number, id: number): Promise<OrderEntity> {
    const order = await this.orderRepository.findOne({
      where: { id, userId },
      relations: [
        'orderItems',
        'orderItems.product',
        'address',
        'restaurant',
        'driver',
      ],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async update(
    userId: number,
    id: number,
    updateOrderDto: UpdateOrderDto,
  ): Promise<OrderEntity> {
    const order = await this.findOne(userId, id);

    // Only allow updating certain fields as a user
    if (updateOrderDto.addressId) {
      const address = await this.addressesService.findOne(
        userId,
        updateOrderDto.addressId,
      );
      order.addressId = address.id;
    }

    if (updateOrderDto.notes !== undefined) {
      order.notes = updateOrderDto.notes;
    }

    // Save the updated order
    await this.orderRepository.save(order);

    return this.findOne(userId, id);
  }

  async cancel(userId: number, id: number): Promise<OrderEntity> {
    const order = await this.findOne(userId, id);

    // Only allow cancellation if order is in a cancellable state
    if (
      order.status === OrderStatus.PENDING ||
      order.status === OrderStatus.CONFIRMED
    ) {
      order.status = OrderStatus.CANCELLED;
      await this.orderRepository.save(order);
      return this.findOne(userId, id);
    } else {
      throw new BadRequestException(
        'Cannot cancel order that is already being prepared or delivered',
      );
    }
  }

  // Admin/Restaurant owner methods
  async findAllForRestaurant(restaurantId: number): Promise<OrderEntity[]> {
    return this.orderRepository.find({
      where: { restaurantId },
      relations: ['orderItems', 'orderItems.product', 'address', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateOrderStatus(
    restaurantId: number,
    id: number,
    status: OrderStatus,
  ): Promise<OrderEntity> {
    const order = await this.orderRepository.findOne({
      where: { id, restaurantId },
      relations: ['orderItems', 'address', 'user'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    order.status = status;

    // If the order is delivered, set the delivery time
    if (status === OrderStatus.DELIVERED) {
      order.deliveredAt = new Date();
    }

    return this.orderRepository.save(order);
  }

  async assignDriverToOrder(
    restaurantId: number,
    orderId: number,
    driverId: number,
  ): Promise<OrderEntity> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, restaurantId },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Check if driver exists and is a driver
    const driver = await this.userRepository.findOne({
      where: { id: driverId, role: UserRole.DRIVER },
    });

    if (!driver) {
      throw new NotFoundException(`Driver with ID ${driverId} not found`);
    }

    order.driverId = driverId;
    return this.orderRepository.save(order);
  }

  // Driver methods
  async findAllForDriver(driverId: number): Promise<OrderEntity[]> {
    return this.orderRepository.find({
      where: { driverId },
      relations: [
        'orderItems',
        'orderItems.product',
        'address',
        'user',
        'restaurant',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async updateDeliveryStatus(
    driverId: number,
    orderId: number,
    status: OrderStatus,
  ): Promise<OrderEntity> {
    // Only allow drivers to update to out_for_delivery or delivered statuses
    if (
      status !== OrderStatus.OUT_FOR_DELIVERY &&
      status !== OrderStatus.DELIVERED
    ) {
      throw new BadRequestException(
        'Drivers can only update to out_for_delivery or delivered status',
      );
    }

    const order = await this.orderRepository.findOne({
      where: { id: orderId, driverId },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    order.status = status;

    // If the order is delivered, set the delivery time
    if (status === OrderStatus.DELIVERED) {
      order.deliveredAt = new Date();
      order.paymentStatus = PaymentStatus.PAID;
    }

    return this.orderRepository.save(order);
  }
}

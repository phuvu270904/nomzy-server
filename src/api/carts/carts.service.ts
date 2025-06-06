import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartEntity } from './entities/cart.entity';
import { CartItemEntity } from './entities/cart-item.entity';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,
    @InjectRepository(CartItemEntity)
    private readonly cartItemRepository: Repository<CartItemEntity>,
    private readonly productsService: ProductsService,
  ) {}

  async getCart(userId: number): Promise<CartEntity> {
    // Try to find existing cart
    let cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['cartItems', 'cartItems.product'],
    });

    // If no cart exists, create one
    if (!cart) {
      cart = this.cartRepository.create({ userId });
      await this.cartRepository.save(cart);
    }

    return cart;
  }

  async addItemToCart(
    userId: number,
    createCartItemDto: CreateCartItemDto,
  ): Promise<CartEntity> {
    const { productId, quantity } = createCartItemDto;

    // Get the user's cart (creates one if it doesn't exist)
    const cart = await this.getCart(userId);

    // Check if the product exists
    const product = await this.productsService.findOne(productId);
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Check if the product is already in the cart
    const existingItem = cart.cartItems?.find(
      (item) => item.productId === productId,
    );

    if (existingItem) {
      // Update quantity if the product is already in the cart
      existingItem.quantity += quantity;
      await this.cartItemRepository.save(existingItem);
    } else {
      // Add new item to the cart
      const newCartItem = this.cartItemRepository.create({
        cartId: cart.id,
        productId,
        quantity,
        price: product.price,
      });
      await this.cartItemRepository.save(newCartItem);
    }

    // Return updated cart
    return this.getCart(userId);
  }

  async updateCartItem(
    userId: number,
    cartItemId: number,
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartEntity> {
    const cart = await this.getCart(userId);

    // Find the cart item and ensure it belongs to this user's cart
    const cartItem = cart.cartItems.find((item) => item.id === cartItemId);

    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID ${cartItemId} not found`);
    }

    // Update the cart item
    if (updateCartItemDto.quantity !== undefined) {
      cartItem.quantity = updateCartItemDto.quantity;
      await this.cartItemRepository.save(cartItem);
    }

    // Return updated cart
    return this.getCart(userId);
  }

  async removeCartItem(
    userId: number,
    cartItemId: number,
  ): Promise<CartEntity> {
    const cart = await this.getCart(userId);

    // Find the cart item and ensure it belongs to this user's cart
    const cartItem = cart.cartItems.find((item) => item.id === cartItemId);

    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID ${cartItemId} not found`);
    }

    // Remove the cart item
    await this.cartItemRepository.remove(cartItem);

    // Return updated cart
    return this.getCart(userId);
  }

  async clearCart(userId: number): Promise<CartEntity> {
    const cart = await this.getCart(userId);

    // Remove all items from the cart
    await this.cartItemRepository.remove(cart.cartItems);

    // Return updated cart
    return this.getCart(userId);
  }
}

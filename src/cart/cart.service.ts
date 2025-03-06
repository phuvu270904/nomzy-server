import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart } from './schema/cart.schema';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private readonly cartModel: Model<Cart>,
  ) {}

  async getCart(user: any) {
    return this.cartModel.find({ user: user.id });
  }

  async clearCart(user: any) {
    await this.cartModel.findByIdAndDelete({ user: user.id });
  }

  async addToCart(body: any) {
    return await this.cartModel.create(body);
  }

  async removeFromCart(productId: string) {
    return await this.cartModel.findOneAndDelete({ productId });
  }

  async removeManyFromCart(body: any): Promise<any> {
    return await this.cartModel.deleteMany({ body });
  }
}

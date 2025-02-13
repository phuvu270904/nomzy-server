import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product } from './schema/product.schema';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
  ) {}

  async getProducts() {
    return this.productModel.find().exec();
  }

  async getProduct(_id: string) {
    return this.productModel.findOne({ _id }).exec();
  }

  async createProduct(body: any) {
    if (body.restaurantId) {
      body.restaurantId = new Types.ObjectId(String(body.restaurantId));
    }
    return this.productModel.create(body);
  }

  async updateProduct(_id: string, body: any) {
    if (body.restaurantId) {
      body.restaurantId = new Types.ObjectId(String(body.restaurantId));
    }
    return this.productModel
      .findOneAndUpdate({ _id }, body, { new: true })
      .exec();
  }

  async deleteProduct(_id: string) {
    return this.productModel.findOneAndDelete({ _id }).exec();
  }
}

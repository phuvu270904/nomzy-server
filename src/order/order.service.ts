import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './schema/order.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
  ) {}

  createOrder(body: any) {
    if (body.restaurantId && body.items) {
      body.restaurantId = new Types.ObjectId(String(body.restaurantId));
      body.items = body.items.map(
        (item: any) => new Types.ObjectId(String(item)),
      );
    }
    return this.orderModel.create(body);
  }

  findOrders() {
    return this.orderModel.find().exec();
  }

  findOrder(_id: string) {
    return this.orderModel.findOne({ _id }).exec();
  }

  updateOrder(_id: string, body: any) {
    if (body.restaurantId && body.items) {
      body.restaurantId = new Types.ObjectId(String(body.restaurantId));
      body.items = body.items.map(
        (item: any) => new Types.ObjectId(String(item)),
      );
    }
    return this.orderModel
      .findOneAndUpdate({ _id }, body, { new: true })
      .exec();
  }

  deleteOrder(_id: string) {
    return this.orderModel.findOneAndDelete({ _id }).exec();
  }
}

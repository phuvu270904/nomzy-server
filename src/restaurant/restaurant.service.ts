import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Restaurant } from './schema/restaurant.schema';
import { Model } from 'mongoose';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectModel(Restaurant.name) private restaurantModel: Model<Restaurant>,
  ) {}
  async getRestaurants(): Promise<Restaurant[]> {
    return this.restaurantModel.find().exec();
  }

  async getRestaurant(_id: string): Promise<any> {
    return this.restaurantModel.findOne({ _id }).exec();
  }

  async createRestaurant(body: any): Promise<Restaurant> {
    return this.restaurantModel.create(body);
  }

  async updateRestaurant(_id: string, body: any): Promise<any> {
    return this.restaurantModel
      .findOneAndUpdate({ _id }, body, { new: true })
      .exec();
  }

  async deleteRestaurant(_id: string): Promise<any> {
    return this.restaurantModel.findOneAndDelete({ _id }).exec();
  }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Restaurant } from './schema/restaurant.schema';
import { Model } from 'mongoose';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectModel(Restaurant.name) private restaurantModel: Model<Restaurant>,
  ) {}
  async getRestaurants() {
    // Logic to get all restaurants
  }

  async getRestaurant() {
    // Logic to get a restaurant
  }

  async createRestaurant() {
    // Logic to create a restaurant
  }

  async updateRestaurant() {
    // Logic to update a restaurant
  }

  async deleteRestaurant() {
    // Logic to delete a restaurant
  }
}

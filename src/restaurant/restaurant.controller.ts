import { Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';

@Controller('restaurant')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Get()
  async getRestaurants() {
    return this.restaurantService.getRestaurants();
  }

  @Get(':id')
  async getRestaurant() {
    return this.restaurantService.getRestaurant();
  }

  @Post()
  async createRestaurant() {
    return this.restaurantService.createRestaurant();
  }

  @Put(':id')
  async updateRestaurant() {
    return this.restaurantService.updateRestaurant();
  }

  @Delete(':id')
  async deleteRestaurant() {
    return this.restaurantService.deleteRestaurant();
  }
}

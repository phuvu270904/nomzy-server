import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { RestaurantService } from './restaurant.service';

@Controller('restaurant')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Get()
  async getRestaurants() {
    return this.restaurantService.getRestaurants();
  }

  @Get(':id')
  async getRestaurant(@Param('id') _id: string) {
    return this.restaurantService.getRestaurant(_id);
  }

  @Post()
  async createRestaurant(@Body() body: any) {
    return this.restaurantService.createRestaurant(body);
  }

  @Put(':id')
  async updateRestaurant(@Param('id') _id: string, @Body() body: any) {
    return this.restaurantService.updateRestaurant(_id, body);
  }

  @Delete(':id')
  async deleteRestaurant(@Param('id') _id: string) {
    return this.restaurantService.deleteRestaurant(_id);
  }
}

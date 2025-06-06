import { Controller, Get, Req } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserEntity } from '../users/entities/user.entity';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/role.enum';

@ApiBearerAuth('access-token')
@ApiTags('Restaurants')
@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get()
  async getAllRestaurants() {
    return this.restaurantsService.getAllRestaurants();
  }

  @Roles(Role.OWNER)
  @Get('info')
  async getRestaurantInfo(@Req() req) {
    return this.restaurantsService.getRestaurantInfo(req.user.id);
  }
}

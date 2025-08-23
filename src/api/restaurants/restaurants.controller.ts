import {
  Controller,
  Get,
  Req,
  Post,
  Param,
  ParseIntPipe,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { UserEntity } from '../users/entities/user.entity';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/role.enum';

@ApiBearerAuth('access-token')
@ApiTags('Restaurants')
@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get()
  async getAllRestaurants(@Req() req) {
    const userId = req.user?.id; // Optional - can be null for unauthenticated users
    return this.restaurantsService.getAllRestaurants(userId);
  }

  @Post(':restaurantId/favorite')
  @Roles(Role.USER)
  @ApiOperation({ summary: 'Add a restaurant to user favorites' })
  @ApiParam({
    name: 'restaurantId',
    description: 'Restaurant ID to add to favorites',
  })
  @ApiResponse({
    status: 201,
    description: 'Restaurant successfully added to favorites',
  })
  async addToFavorites(
    @Req() req,
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
  ) {
    return this.restaurantsService.addToFavorites(req.user.id, restaurantId);
  }

  @Delete(':restaurantId/favorite')
  @Roles(Role.USER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a restaurant from user favorites' })
  @ApiParam({
    name: 'restaurantId',
    description: 'Restaurant ID to remove from favorites',
  })
  @ApiResponse({
    status: 204,
    description: 'Restaurant successfully removed from favorites',
  })
  async removeFromFavorites(
    @Req() req,
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
  ) {
    return this.restaurantsService.removeFromFavorites(
      req.user.id,
      restaurantId,
    );
  }

  @Roles(Role.OWNER)
  @Get('info')
  async getRestaurantInfo(@Req() req) {
    return this.restaurantsService.getRestaurantInfo(req.user.id);
  }
}

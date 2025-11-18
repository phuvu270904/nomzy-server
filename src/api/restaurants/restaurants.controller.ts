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
  Query,
} from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UserEntity } from '../users/entities/user.entity';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/role.enum';
import { SearchRestaurantDto } from './dto/search-restaurant.dto';

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

  @Get('search')
  @ApiOperation({
    summary: 'Search restaurants by name or product name',
    description:
      'Search for restaurants by their name or by products they offer. Returns restaurant details with offers/coupons.',
  })
  @ApiQuery({
    name: 'query',
    required: false,
    description: 'Search query for restaurant name or product name',
    example: 'pizza',
  })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
  })
  async searchRestaurants(
    @Query('query') query: string,
    @Req() req,
  ) {
    const userId = req.user?.id;
    return this.restaurantsService.searchRestaurants(query, userId);
  }

  @Roles(Role.OWNER)
  @Get('info')
  async getRestaurantInfo(@Req() req) {
    return this.restaurantsService.getRestaurantInfo(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get restaurant details by ID' })
  @ApiParam({ name: 'id', description: 'Restaurant ID' })
  @ApiResponse({
    status: 200,
    description: 'Restaurant details retrieved successfully',
    type: UserEntity,
  })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  async getRestaurantById(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const userId = req.user.id;
    return this.restaurantsService.getRestaurantById(id, userId);
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
}

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

  @ApiOperation({
    summary: 'Get all restaurants',
    description: 'Retrieve a list of all restaurants with their details, offers, and coupons. Includes favorite status if user is authenticated.'
  })
  @ApiResponse({
    status: 200,
    description: 'List of restaurants retrieved successfully',
    schema: {
      example: [
        {
          id: 1,
          name: 'Pizza Palace',
          email: 'contact@pizzapalace.com',
          phone_number: '0938123456',
          avatar: 'https://example.com/restaurant-avatar.jpg',
          address: '123 Main St',
          city: 'Ho Chi Minh City',
          country: 'Vietnam',
          rating: 4.5,
          role: 'owner',
          isFullyRegistered: true,
          isFavorite: true,
          offers: [
            {
              id: 1,
              title: '20% off on orders above $50',
              discount: 20,
              validUntil: '2025-12-31T23:59:59Z'
            }
          ],
          createdAt: '2025-01-15T10:30:00Z',
          updatedAt: '2025-11-29T10:30:00Z',
        }
      ]
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token (optional for this endpoint)'
  })
  @Get()
  async getAllRestaurants(@Req() req) {
    const userId = req.user?.id; // Optional - can be null for unauthenticated users
    return this.restaurantsService.getAllRestaurants(userId);
  }

  @ApiOperation({
    summary: 'Search restaurants by name or product name',
    description:
      'Search for restaurants by their name or by products they offer. Returns restaurant details with offers/coupons. User authentication is optional but recommended for favorite status.'
  })
  @ApiQuery({
    name: 'query',
    required: false,
    description: 'Search query for restaurant name or product name. If empty, returns all restaurants.',
    example: 'pizza',
  })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
    schema: {
      example: [
        {
          id: 1,
          name: 'Pizza Palace',
          email: 'contact@pizzapalace.com',
          phone_number: '0938123456',
          avatar: 'https://example.com/restaurant-avatar.jpg',
          address: '123 Main St',
          city: 'Ho Chi Minh City',
          country: 'Vietnam',
          rating: 4.5,
          isFavorite: false,
          matchedProducts: [
            {
              id: 10,
              name: 'Margherita Pizza',
              price: 15.99,
              description: 'Classic Italian pizza'
            }
          ],
          offers: [],
          createdAt: '2025-01-15T10:30:00Z',
        }
      ]
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid query parameter'
  })
  @Get('search')
  async searchRestaurants(
    @Query('query') query: string,
    @Req() req,
  ) {
    const userId = req.user?.id;
    return this.restaurantsService.searchRestaurants(query, userId);
  }

  @ApiOperation({
    summary: 'Get current restaurant owner info',
    description: 'Retrieve detailed information about the restaurant owned by the authenticated owner. Owner role required.'
  })
  @ApiResponse({
    status: 200,
    description: 'Restaurant information retrieved successfully',
    schema: {
      example: {
        id: 1,
        name: 'Pizza Palace',
        email: 'owner@pizzapalace.com',
        phone_number: '0938123456',
        avatar: 'https://example.com/restaurant-avatar.jpg',
        address: '123 Main St',
        city: 'Ho Chi Minh City',
        country: 'Vietnam',
        role: 'owner',
        isFullyRegistered: true,
        products: [
          {
            id: 10,
            name: 'Margherita Pizza',
            price: 15.99,
            category: 'Pizza',
            isAvailable: true
          }
        ],
        totalOrders: 150,
        totalRevenue: 5000.50,
        rating: 4.5,
        createdAt: '2025-01-15T10:30:00Z',
        updatedAt: '2025-11-29T10:30:00Z',
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Owner role required'
  })
  @ApiResponse({
    status: 404,
    description: 'Restaurant not found for this owner'
  })
  @Roles(Role.OWNER)
  @Get('info')
  async getRestaurantInfo(@Req() req) {
    return this.restaurantsService.getRestaurantInfo(req.user.id);
  }

  @ApiOperation({ 
    summary: 'Get restaurant details by ID',
    description: 'Retrieve detailed information about a specific restaurant including products, offers, coupons, and favorite status for the authenticated user.'
  })
  @ApiParam({ 
    name: 'id', 
    type: 'number',
    description: 'Restaurant ID',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Restaurant details retrieved successfully',
    schema: {
      example: {
        id: 1,
        name: 'Pizza Palace',
        email: 'contact@pizzapalace.com',
        phone_number: '0938123456',
        avatar: 'https://example.com/restaurant-avatar.jpg',
        address: '123 Main St',
        city: 'Ho Chi Minh City',
        country: 'Vietnam',
        role: 'owner',
        rating: 4.5,
        isFullyRegistered: true,
        isFavorite: true,
        products: [
          {
            id: 10,
            name: 'Margherita Pizza',
            price: 15.99,
            description: 'Classic Italian pizza',
            image: 'https://example.com/pizza.jpg',
            category: 'Pizza',
            isAvailable: true
          }
        ],
        offers: [
          {
            id: 1,
            title: '20% off on orders above $50',
            description: 'Get 20% discount on all orders above $50',
            discount: 20,
            minOrderAmount: 50,
            validFrom: '2025-11-01T00:00:00Z',
            validUntil: '2025-12-31T23:59:59Z'
          }
        ],
        coupons: [
          {
            id: 5,
            code: 'PIZZA20',
            discount: 20,
            validUntil: '2025-12-31T23:59:59Z'
          }
        ],
        feedbacks: [
          {
            id: 1,
            rating: 5,
            comment: 'Excellent pizza!',
            user: {
              id: 2,
              name: 'John Doe'
            },
            createdAt: '2025-11-20T15:30:00Z'
          }
        ],
        createdAt: '2025-01-15T10:30:00Z',
        updatedAt: '2025-11-29T10:30:00Z',
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Restaurant not found' 
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token'
  })
  @Get(':id')
  async getRestaurantById(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const userId = req.user.id;
    return this.restaurantsService.getRestaurantById(id, userId);
  }

  @ApiOperation({ 
    summary: 'Add restaurant to favorites',
    description: 'Add a restaurant to the authenticated user\'s favorites list. User role required.'
  })
  @ApiParam({
    name: 'restaurantId',
    type: 'number',
    description: 'Restaurant ID to add to favorites',
    example: 1
  })
  @ApiResponse({
    status: 201,
    description: 'Restaurant successfully added to favorites',
    schema: {
      example: {
        message: 'Restaurant added to favorites successfully',
        favorite: {
          id: 1,
          userId: 2,
          restaurantId: 1,
          createdAt: '2025-11-29T10:30:00Z'
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Restaurant already in favorites'
  })
  @ApiResponse({
    status: 404,
    description: 'Restaurant not found'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User role required'
  })
  @Roles(Role.USER)
  @Post(':restaurantId/favorite')
  async addToFavorites(
    @Req() req,
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
  ) {
    return this.restaurantsService.addToFavorites(req.user.id, restaurantId);
  }

  @ApiOperation({ 
    summary: 'Remove restaurant from favorites',
    description: 'Remove a restaurant from the authenticated user\'s favorites list. User role required.'
  })
  @ApiParam({
    name: 'restaurantId',
    type: 'number',
    description: 'Restaurant ID to remove from favorites',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Restaurant successfully removed from favorites',
    schema: {
      example: {
        message: 'Restaurant removed from favorites successfully'
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Restaurant not found in favorites or restaurant does not exist'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User role required'
  })
  @Roles(Role.USER)
  @Delete(':restaurantId/favorite')
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

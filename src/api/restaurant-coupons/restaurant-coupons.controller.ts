import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Req,
} from '@nestjs/common';
import { RestaurantCouponsService } from './restaurant-coupons.service';
import { CreateRestaurantCouponDto } from './dto/create-restaurant-coupon.dto';
import { UpdateRestaurantCouponDto } from './dto/update-restaurant-coupon.dto';
import { 
  ApiTags, 
  ApiBearerAuth, 
  ApiOperation, 
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/role.enum';

@ApiBearerAuth('access-token')
@ApiTags('Restaurant Coupons')
@Controller('restaurant-coupons')
export class RestaurantCouponsController {
  constructor(
    private readonly restaurantCouponsService: RestaurantCouponsService,
  ) {}

  @ApiOperation({
    summary: 'Add coupon to restaurant',
    description: 'Add an existing coupon to the restaurant or create a new coupon for the restaurant. Owner role required. You can either provide a couponId to link an existing coupon, or provide coupon details to create a new one.'
  })
  @ApiBody({ type: CreateRestaurantCouponDto })
  @ApiResponse({
    status: 201,
    description: 'Coupon successfully added to restaurant',
    schema: {
      example: {
        id: 1,
        restaurantId: 5,
        couponId: 10,
        coupon: {
          id: 10,
          name: 'Summer Discount',
          code: 'SUMMER2025',
          description: 'Get 20% off on your next order',
          type: 'percentage',
          value: 20,
          minOrderAmount: 50,
          maxDiscountAmount: 100,
          validFrom: '2025-06-01T00:00:00Z',
          validUntil: '2025-07-31T23:59:59Z',
          isActive: true,
          isGlobal: false,
          usageLimit: 100,
          usageCount: 0,
        },
        createdAt: '2025-11-29T10:30:00Z',
        updatedAt: '2025-11-29T10:30:00Z',
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data, coupon already added, or coupon code already exists'
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
    description: 'Coupon not found (when using couponId)'
  })
  @Roles(Role.OWNER)
  @Post()
  async create(
    @Req() req,
    @Body() createRestaurantCouponDto: CreateRestaurantCouponDto,
  ) {
    return this.restaurantCouponsService.create(
      req.user.id,
      createRestaurantCouponDto,
    );
  }

  @ApiOperation({
    summary: 'Get coupons for current restaurant',
    description: 'Retrieve all coupons associated with the authenticated restaurant owner\'s restaurant. Owner role required.'
  })
  @ApiResponse({
    status: 200,
    description: 'List of restaurant coupons retrieved successfully',
    schema: {
      example: [
        {
          id: 1,
          restaurantId: 5,
          couponId: 10,
          coupon: {
            id: 10,
            name: 'Summer Discount',
            code: 'SUMMER2025',
            description: 'Get 20% off on your next order',
            type: 'percentage',
            value: 20,
            minOrderAmount: 50,
            maxDiscountAmount: 100,
            validFrom: '2025-06-01T00:00:00Z',
            validUntil: '2025-07-31T23:59:59Z',
            isActive: true,
            isGlobal: false,
            usageLimit: 100,
            usageCount: 25,
          },
          createdAt: '2025-06-01T10:30:00Z',
          updatedAt: '2025-11-20T14:15:00Z',
        },
        {
          id: 2,
          restaurantId: 5,
          couponId: 15,
          coupon: {
            id: 15,
            name: 'Winter Special',
            code: 'WINTER2025',
            description: 'Fixed $10 discount',
            type: 'fixed',
            value: 10,
            minOrderAmount: 25,
            maxDiscountAmount: null,
            validFrom: '2025-12-01T00:00:00Z',
            validUntil: '2026-02-28T23:59:59Z',
            isActive: true,
            isGlobal: false,
            usageLimit: 200,
            usageCount: 5,
          },
          createdAt: '2025-11-25T08:00:00Z',
          updatedAt: '2025-11-29T10:30:00Z',
        }
      ]
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
  @Roles(Role.OWNER)
  @Get()
  async findAll(@Req() req) {
    return this.restaurantCouponsService.findAllByRestaurant(req.user.id);
  }

  @ApiOperation({
    summary: 'Get all restaurant coupons',
    description: 'Retrieve all restaurant-coupon associations in the system. Returns all coupons linked to any restaurant.'
  })
  @ApiResponse({
    status: 200,
    description: 'List of all restaurant coupons retrieved successfully',
    schema: {
      example: [
        {
          id: 1,
          restaurantId: 5,
          couponId: 10,
          restaurant: {
            id: 5,
            name: 'Pizza Palace',
            email: 'owner@pizzapalace.com',
          },
          coupon: {
            id: 10,
            name: 'Summer Discount',
            code: 'SUMMER2025',
            type: 'percentage',
            value: 20,
            isActive: true,
          },
          createdAt: '2025-06-01T10:30:00Z',
          updatedAt: '2025-11-20T14:15:00Z',
        }
      ]
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token'
  })
  @Get('all')
  async findAllCoupons() {
    return this.restaurantCouponsService.findAllCoupons();
  }

  @ApiOperation({
    summary: 'Get coupons by restaurant ID',
    description: 'Retrieve all coupons associated with a specific restaurant by restaurant ID. Public endpoint.'
  })
  @ApiParam({
    name: 'restaurantId',
    type: 'number',
    description: 'Restaurant ID',
    example: 5
  })
  @ApiResponse({
    status: 200,
    description: 'List of restaurant coupons retrieved successfully',
    schema: {
      example: [
        {
          id: 1,
          restaurantId: 5,
          couponId: 10,
          coupon: {
            id: 10,
            name: 'Summer Discount',
            code: 'SUMMER2025',
            description: 'Get 20% off on your next order',
            type: 'percentage',
            value: 20,
            minOrderAmount: 50,
            maxDiscountAmount: 100,
            validFrom: '2025-06-01T00:00:00Z',
            validUntil: '2025-07-31T23:59:59Z',
            isActive: true,
            isGlobal: false,
            usageLimit: 100,
            usageCount: 25,
          },
          createdAt: '2025-06-01T10:30:00Z',
          updatedAt: '2025-11-20T14:15:00Z',
        }
      ]
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
  @Get('restaurant/:restaurantId')
  async findAllByRestaurant(@Param('restaurantId') restaurantId: number) {
    return this.restaurantCouponsService.findAllByRestaurant(restaurantId);
  }

  @ApiOperation({
    summary: 'Get restaurant coupon by ID',
    description: 'Retrieve detailed information about a specific restaurant-coupon association by its ID. Owner role required.'
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Restaurant coupon ID',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Restaurant coupon found and retrieved successfully',
    schema: {
      example: {
        id: 1,
        restaurantId: 5,
        couponId: 10,
        coupon: {
          id: 10,
          name: 'Summer Discount',
          code: 'SUMMER2025',
          description: 'Get 20% off on your next order',
          type: 'percentage',
          value: 20,
          minOrderAmount: 50,
          maxDiscountAmount: 100,
          validFrom: '2025-06-01T00:00:00Z',
          validUntil: '2025-07-31T23:59:59Z',
          isActive: true,
          isGlobal: false,
          usageLimit: 100,
          usageCount: 25,
        },
        createdAt: '2025-06-01T10:30:00Z',
        updatedAt: '2025-11-20T14:15:00Z',
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Restaurant coupon not found'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Owner role required'
  })
  @Roles(Role.OWNER)
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.restaurantCouponsService.findOne(id);
  }

  @ApiOperation({
    summary: 'Update restaurant coupon',
    description: 'Update the coupon details associated with a restaurant. Owner role required. Only the owner of the restaurant can update their coupons.'
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Restaurant coupon ID to update',
    example: 1
  })
  @ApiBody({ type: UpdateRestaurantCouponDto })
  @ApiResponse({
    status: 200,
    description: 'Restaurant coupon updated successfully',
    schema: {
      example: {
        id: 1,
        restaurantId: 5,
        couponId: 10,
        coupon: {
          id: 10,
          name: 'Summer Discount Updated',
          code: 'SUMMER2025',
          description: 'Get 25% off on your next order',
          type: 'percentage',
          value: 25,
          minOrderAmount: 40,
          maxDiscountAmount: 120,
          validFrom: '2025-06-01T00:00:00Z',
          validUntil: '2025-08-31T23:59:59Z',
          isActive: true,
          isGlobal: false,
          usageLimit: 150,
          usageCount: 25,
        },
        updatedAt: '2025-11-29T10:30:00Z',
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data'
  })
  @ApiResponse({
    status: 404,
    description: 'Restaurant coupon not found'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Owner role required or not the owner of this restaurant'
  })
  @Roles(Role.OWNER)
  @Patch(':id')
  async update(
    @Req() req,
    @Param('id') id: number,
    @Body() updateRestaurantCouponDto: UpdateRestaurantCouponDto,
  ) {
    return this.restaurantCouponsService.update(
      id,
      req.user.id,
      updateRestaurantCouponDto,
    );
  }

  @ApiOperation({
    summary: 'Remove coupon from restaurant',
    description: 'Remove the association between a coupon and the restaurant. Owner role required. This does not delete the coupon itself, only removes it from the restaurant. Only the owner of the restaurant can remove their coupons.'
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Restaurant coupon ID to remove',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Coupon successfully removed from restaurant',
    schema: {
      example: {
        message: 'Coupon removed from restaurant successfully'
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Restaurant coupon not found'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Owner role required or not the owner of this restaurant'
  })
  @Roles(Role.OWNER)
  @Delete(':id')
  async remove(@Req() req, @Param('id') id: number) {
    return this.restaurantCouponsService.remove(id, req.user.id);
  }
}

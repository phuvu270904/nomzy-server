import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Req,
} from '@nestjs/common';
import { CouponSentService } from './coupon-sent.service';
import { CreateCouponSentDto } from './dto/create-coupon-sent.dto';
import { UpdateCouponSentDto } from './dto/update-coupon-sent.dto';
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
@ApiTags('Coupon Sent')
@Controller('coupon-sent')
@Roles(Role.ADMIN)
export class CouponSentController {
  constructor(private readonly couponSentService: CouponSentService) {}

  @ApiOperation({
    summary: 'Send coupon to users or restaurants',
    description: 'Create a coupon distribution record to send coupons to all users, all restaurants, an individual user, or an individual restaurant. Admin access required.'
  })
  @ApiBody({ type: CreateCouponSentDto })
  @ApiResponse({
    status: 201,
    description: 'Coupon sent record created successfully',
    schema: {
      example: {
        id: 1,
        couponId: 10,
        sentType: 'all_users',
        sentToUserId: null,
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
          isGlobal: true,
        },
        createdAt: '2025-11-29T10:30:00Z',
        updatedAt: '2025-11-29T10:30:00Z',
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid coupon ID, sent type, or user ID'
  })
  @ApiResponse({
    status: 404,
    description: 'Coupon or user not found'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required'
  })
  @Post()
  async create(@Body() createCouponSentDto: CreateCouponSentDto) {
    return this.couponSentService.create(createCouponSentDto);
  }

  @ApiOperation({
    summary: 'Get all coupon sent records',
    description: 'Retrieve all coupon distribution records showing which coupons were sent to which users or restaurants. Admin access required.'
  })
  @ApiResponse({
    status: 200,
    description: 'List of coupon sent records retrieved successfully',
    schema: {
      example: [
        {
          id: 1,
          couponId: 10,
          sentType: 'all_users',
          sentToUserId: null,
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
            isGlobal: true,
          },
          createdAt: '2025-06-01T10:30:00Z',
          updatedAt: '2025-11-20T14:15:00Z',
        },
        {
          id: 2,
          couponId: 15,
          sentType: 'individual_user',
          sentToUserId: 5,
          sentToUser: {
            id: 5,
            name: 'John Doe',
            email: 'john.doe@gmail.com',
          },
          coupon: {
            id: 15,
            name: 'Welcome Bonus',
            code: 'WELCOME10',
            description: 'Fixed $10 discount for new users',
            type: 'fixed',
            value: 10,
            minOrderAmount: 20,
            maxDiscountAmount: null,
            validFrom: '2025-11-01T00:00:00Z',
            validUntil: '2025-12-31T23:59:59Z',
            isActive: true,
            isGlobal: false,
          },
          createdAt: '2025-11-15T09:20:00Z',
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
    description: 'Forbidden - Admin role required'
  })
  @Get()
  async findAll() {
    return this.couponSentService.findAll();
  }

  @ApiOperation({
    summary: 'Get coupon sent record by ID',
    description: 'Retrieve detailed information about a specific coupon distribution record by its ID. Admin access required.'
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Coupon sent record ID',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Coupon sent record found and retrieved successfully',
    schema: {
      example: {
        id: 1,
        couponId: 10,
        sentType: 'all_users',
        sentToUserId: null,
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
          isGlobal: true,
          usageLimit: 100,
          usageCount: 45,
        },
        createdAt: '2025-06-01T10:30:00Z',
        updatedAt: '2025-11-20T14:15:00Z',
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Coupon sent record not found'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required'
  })
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.couponSentService.findOne(id);
  }

  @ApiOperation({
    summary: 'Update coupon sent record',
    description: 'Update the statistics or details of a coupon distribution record. Admin access required. Typically used to track usage statistics.'
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Coupon sent record ID to update',
    example: 1
  })
  @ApiBody({ type: UpdateCouponSentDto })
  @ApiResponse({
    status: 200,
    description: 'Coupon sent record updated successfully',
    schema: {
      example: {
        id: 1,
        couponId: 10,
        sentType: 'all_users',
        sentToUserId: null,
        claimedCount: 150,
        usedCount: 85,
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
          isGlobal: true,
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
    description: 'Coupon sent record not found'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required'
  })
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateCouponSentDto: UpdateCouponSentDto,
  ) {
    return this.couponSentService.update(id, updateCouponSentDto);
  }

  @ApiOperation({
    summary: 'Delete coupon sent record',
    description: 'Permanently delete a coupon distribution record by ID. Admin access required. This action cannot be undone.'
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Coupon sent record ID to delete',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Coupon sent record deleted successfully',
    schema: {
      example: {
        message: 'Coupon sent record deleted successfully'
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Coupon sent record not found'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required'
  })
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.couponSentService.remove(id);
  }
}

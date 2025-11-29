import { Controller, Get, Post, Body, Param, Put, Req } from '@nestjs/common';
import { UserCouponsService } from './user-coupons.service';
import { ClaimCouponDto } from './dto/claim-coupon.dto';
import { UpdateUserCouponDto } from './dto/update-user-coupon.dto';
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
@Roles(Role.USER)
@ApiTags('User Coupons')
@Controller('user-coupons')
export class UserCouponsController {
  constructor(private readonly userCouponsService: UserCouponsService) {}

  @ApiOperation({
    summary: 'Claim a coupon',
    description: 'Allow user to claim a coupon by providing the coupon ID. User role required. The coupon will be added to the user\'s collection with status "claimed".'
  })
  @ApiBody({ type: ClaimCouponDto })
  @ApiResponse({
    status: 201,
    description: 'Coupon successfully claimed',
    schema: {
      example: {
        id: 1,
        userId: 5,
        couponId: 10,
        status: 'claimed',
        usedAt: null,
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
        createdAt: '2025-11-29T10:30:00Z',
        updatedAt: '2025-11-29T10:30:00Z',
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Coupon already claimed, expired, inactive, or usage limit reached'
  })
  @ApiResponse({
    status: 404,
    description: 'Coupon not found'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User role required'
  })
  @Post('claim')
  async claim(@Req() req, @Body() claimCouponDto: ClaimCouponDto) {
    return this.userCouponsService.claimCoupon(req.user.id, claimCouponDto);
  }

  @ApiOperation({
    summary: 'Get all user coupons',
    description: 'Retrieve all coupons claimed by the authenticated user, including claimed, used, and expired coupons. User role required.'
  })
  @ApiResponse({
    status: 200,
    description: 'List of user coupons retrieved successfully',
    schema: {
      example: [
        {
          id: 1,
          userId: 5,
          couponId: 10,
          status: 'claimed',
          usedAt: null,
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
          createdAt: '2025-06-15T10:30:00Z',
          updatedAt: '2025-11-29T10:30:00Z',
        },
        {
          id: 2,
          userId: 5,
          couponId: 15,
          status: 'used',
          usedAt: '2025-11-20T14:30:00Z',
          coupon: {
            id: 15,
            name: 'Welcome Offer',
            code: 'WELCOME10',
            description: 'Fixed $10 discount for new users',
            type: 'fixed',
            value: 10,
            minOrderAmount: 20,
            maxDiscountAmount: null,
            validFrom: '2025-01-01T00:00:00Z',
            validUntil: '2025-12-31T23:59:59Z',
            isActive: true,
            isGlobal: true,
            usageLimit: 0,
            usageCount: 523,
          },
          createdAt: '2025-11-10T08:15:00Z',
          updatedAt: '2025-11-20T14:30:00Z',
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
    description: 'Forbidden - User role required'
  })
  @Get()
  async findAll(@Req() req) {
    return this.userCouponsService.findAllByUser(req.user.id);
  }

  @ApiOperation({
    summary: 'Get active user coupons',
    description: 'Retrieve only active (claimed but not used or expired) coupons for the authenticated user. User role required.'
  })
  @ApiResponse({
    status: 200,
    description: 'List of active user coupons retrieved successfully',
    schema: {
      example: [
        {
          id: 1,
          userId: 5,
          couponId: 10,
          status: 'claimed',
          usedAt: null,
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
          createdAt: '2025-06-15T10:30:00Z',
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
    description: 'Forbidden - User role required'
  })
  @Get('active')
  async findActive(@Req() req) {
    return this.userCouponsService.findUserActiveCoupons(req.user.id);
  }

  @ApiOperation({
    summary: 'Get user coupon by ID',
    description: 'Retrieve detailed information about a specific user coupon by its ID. User role required. Can only access own coupons.'
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'User coupon ID',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'User coupon found and retrieved successfully',
    schema: {
      example: {
        id: 1,
        userId: 5,
        couponId: 10,
        status: 'claimed',
        usedAt: null,
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
        createdAt: '2025-06-15T10:30:00Z',
        updatedAt: '2025-11-29T10:30:00Z',
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'User coupon not found or does not belong to the user'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User role required'
  })
  @Get(':id')
  async findOne(@Req() req, @Param('id') id: number) {
    return this.userCouponsService.findOne(id, req.user.id);
  }

  @ApiOperation({
    summary: 'Update user coupon',
    description: 'Update the status of a user coupon (e.g., mark as used). User role required. Can only update own coupons.'
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'User coupon ID to update',
    example: 1
  })
  @ApiBody({ type: UpdateUserCouponDto })
  @ApiResponse({
    status: 200,
    description: 'User coupon updated successfully',
    schema: {
      example: {
        id: 1,
        userId: 5,
        couponId: 10,
        status: 'used',
        usedAt: '2025-11-29T10:30:00Z',
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
          usageCount: 46,
        },
        createdAt: '2025-06-15T10:30:00Z',
        updatedAt: '2025-11-29T10:30:00Z',
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid status or coupon already used/expired'
  })
  @ApiResponse({
    status: 404,
    description: 'User coupon not found or does not belong to the user'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User role required'
  })
  @Put(':id')
  async update(
    @Req() req,
    @Param('id') id: number,
    @Body() updateUserCouponDto: UpdateUserCouponDto,
  ) {
    return this.userCouponsService.update(id, req.user.id, updateUserCouponDto);
  }

  @ApiOperation({
    summary: 'Mark coupon as expired',
    description: 'Mark a user coupon as expired. User role required. This is typically used by a system job or admin process to expire outdated coupons.'
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'User coupon ID to mark as expired',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'User coupon marked as expired successfully',
    schema: {
      example: {
        id: 1,
        userId: 5,
        couponId: 10,
        status: 'expired',
        usedAt: null,
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
        createdAt: '2025-06-15T10:30:00Z',
        updatedAt: '2025-11-29T10:30:00Z',
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'User coupon not found'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User role required'
  })
  @Put(':id/expire')
  async markAsExpired(@Param('id') id: number) {
    return this.userCouponsService.markAsExpired(id);
  }
}

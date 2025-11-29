import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
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
@ApiTags('Coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @ApiOperation({
    summary: 'Create new coupon',
    description: 'Create a new coupon with discount details and validity period. Admin access required.'
  })
  @ApiBody({ type: CreateCouponDto })
  @ApiResponse({
    status: 201,
    description: 'Coupon created successfully',
    schema: {
      example: {
        id: 1,
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
        createdAt: '2025-11-29T10:30:00Z',
        updatedAt: '2025-11-29T10:30:00Z',
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input or coupon code already exists'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required'
  })
  @Roles(Role.ADMIN)
  @Post()
  async create(@Body() createCouponDto: CreateCouponDto) {
    return this.couponsService.create(createCouponDto);
  }

  @ApiOperation({
    summary: 'Get all coupons',
    description: 'Retrieve a list of all coupons in the system (both global and restaurant-specific). Admin access required.'
  })
  @ApiResponse({
    status: 200,
    description: 'List of coupons retrieved successfully',
    schema: {
      example: [
        {
          id: 1,
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
          createdAt: '2025-06-01T10:30:00Z',
          updatedAt: '2025-11-20T14:15:00Z',
        },
        {
          id: 2,
          name: 'Black Friday Sale',
          code: 'BLACKFRIDAY2025',
          description: 'Fixed $15 discount',
          type: 'fixed',
          value: 15,
          minOrderAmount: 30,
          maxDiscountAmount: null,
          validFrom: '2025-11-25T00:00:00Z',
          validUntil: '2025-11-30T23:59:59Z',
          isActive: true,
          isGlobal: false,
          usageLimit: 50,
          usageCount: 12,
          createdAt: '2025-11-01T10:30:00Z',
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
  @Roles(Role.ADMIN)
  @Get()
  async findAll() {
    return this.couponsService.findAll();
  }

  @ApiOperation({
    summary: 'Get all global coupons',
    description: 'Retrieve a list of all globally available coupons that can be used by any user at any restaurant.'
  })
  @ApiResponse({
    status: 200,
    description: 'List of global coupons retrieved successfully',
    schema: {
      example: [
        {
          id: 1,
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
  @Get('global')
  async findAllGlobal() {
    return this.couponsService.findAllGlobal();
  }

  @ApiOperation({
    summary: 'Get coupon by ID',
    description: 'Retrieve detailed information about a specific coupon by its ID.'
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Coupon ID',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Coupon found and retrieved successfully',
    schema: {
      example: {
        id: 1,
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
        createdAt: '2025-06-01T10:30:00Z',
        updatedAt: '2025-11-20T14:15:00Z',
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Coupon not found'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token'
  })
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.couponsService.findOne(id);
  }

  @ApiOperation({
    summary: 'Get coupon by code',
    description: 'Retrieve coupon information by its unique code. Useful for validating coupon codes during checkout.'
  })
  @ApiParam({
    name: 'code',
    type: 'string',
    description: 'Coupon code',
    example: 'SUMMER2025'
  })
  @ApiResponse({
    status: 200,
    description: 'Coupon found and retrieved successfully',
    schema: {
      example: {
        id: 1,
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
        remainingUses: 55,
        createdAt: '2025-06-01T10:30:00Z',
        updatedAt: '2025-11-20T14:15:00Z',
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Coupon code not found'
  })
  @ApiResponse({
    status: 400,
    description: 'Coupon is expired, inactive, or usage limit reached'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token'
  })
  @Get('code/:code')
  async findByCode(@Param('code') code: string) {
    return this.couponsService.findByCode(code);
  }

  @ApiOperation({
    summary: 'Update coupon',
    description: 'Update coupon information by ID. Admin access required. All fields are optional.'
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Coupon ID to update',
    example: 1
  })
  @ApiBody({ type: UpdateCouponDto })
  @ApiResponse({
    status: 200,
    description: 'Coupon updated successfully',
    schema: {
      example: {
        id: 1,
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
        isGlobal: true,
        usageLimit: 150,
        usageCount: 45,
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
    description: 'Coupon not found'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required'
  })
  @Roles(Role.ADMIN)
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateCouponDto: UpdateCouponDto,
  ) {
    return this.couponsService.update(id, updateCouponDto);
  }

  @ApiOperation({
    summary: 'Delete coupon',
    description: 'Permanently delete a coupon by ID. Admin access required. This action cannot be undone.'
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Coupon ID to delete',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Coupon deleted successfully',
    schema: {
      example: {
        message: 'Coupon deleted successfully'
      }
    }
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
    description: 'Forbidden - Admin role required'
  })
  @Roles(Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.couponsService.remove(id);
  }

  @ApiOperation({
    summary: 'Deactivate coupon',
    description: 'Deactivate a coupon without deleting it. Deactivated coupons cannot be used but remain in the system. Admin access required.'
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Coupon ID to deactivate',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Coupon deactivated successfully',
    schema: {
      example: {
        id: 1,
        name: 'Summer Discount',
        code: 'SUMMER2025',
        description: 'Get 20% off on your next order',
        type: 'percentage',
        value: 20,
        minOrderAmount: 50,
        maxDiscountAmount: 100,
        validFrom: '2025-06-01T00:00:00Z',
        validUntil: '2025-07-31T23:59:59Z',
        isActive: false,
        isGlobal: true,
        usageLimit: 100,
        usageCount: 45,
        updatedAt: '2025-11-29T10:30:00Z',
      }
    }
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
    description: 'Forbidden - Admin role required'
  })
  @Roles(Role.ADMIN)
  @Put(':id/deactivate')
  async deactivate(@Param('id') id: number) {
    return this.couponsService.deactivate(id);
  }
}

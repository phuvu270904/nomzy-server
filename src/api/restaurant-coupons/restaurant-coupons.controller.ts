import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { RestaurantCouponsService } from './restaurant-coupons.service';
import { CreateRestaurantCouponDto } from './dto/create-restaurant-coupon.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/role.enum';

@ApiBearerAuth('access-token')
@ApiTags('Restaurant Coupons')
@Controller('restaurant-coupons')
export class RestaurantCouponsController {
  constructor(
    private readonly restaurantCouponsService: RestaurantCouponsService,
  ) {}

  @Post()
  @Roles(Role.OWNER)
  async create(
    @Req() req,
    @Body() createRestaurantCouponDto: CreateRestaurantCouponDto,
  ) {
    return this.restaurantCouponsService.create(
      req.user.id,
      createRestaurantCouponDto,
    );
  }

  @Get()
  @Roles(Role.OWNER)
  async findAll(@Req() req) {
    return this.restaurantCouponsService.findAllByRestaurant(req.user.id);
  }

  @Get(':id')
  @Roles(Role.OWNER)
  async findOne(@Param('id') id: number) {
    return this.restaurantCouponsService.findOne(id);
  }

  @Delete(':id')
  @Roles(Role.OWNER)
  async remove(@Req() req, @Param('id') id: number) {
    return this.restaurantCouponsService.remove(id, req.user.id);
  }
}

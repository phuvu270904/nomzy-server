import { Controller, Get, Post, Body, Param, Put, Req } from '@nestjs/common';
import { UserCouponsService } from './user-coupons.service';
import { ClaimCouponDto } from './dto/claim-coupon.dto';
import { UpdateUserCouponDto } from './dto/update-user-coupon.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/role.enum';

@ApiBearerAuth('access-token')
@Roles(Role.USER)
@ApiTags('User Coupons')
@Controller('user-coupons')
export class UserCouponsController {
  constructor(private readonly userCouponsService: UserCouponsService) {}

  @Post('claim')
  async claim(@Req() req, @Body() claimCouponDto: ClaimCouponDto) {
    return this.userCouponsService.claimCoupon(req.user.id, claimCouponDto);
  }

  @Get()
  async findAll(@Req() req) {
    return this.userCouponsService.findAllByUser(req.user.id);
  }

  @Get('active')
  async findActive(@Req() req) {
    return this.userCouponsService.findUserActiveCoupons(req.user.id);
  }

  @Get(':id')
  async findOne(@Req() req, @Param('id') id: number) {
    return this.userCouponsService.findOne(id, req.user.id);
  }

  @Put(':id')
  async update(
    @Req() req,
    @Param('id') id: number,
    @Body() updateUserCouponDto: UpdateUserCouponDto,
  ) {
    return this.userCouponsService.update(id, req.user.id, updateUserCouponDto);
  }

  @Put(':id/expire')
  async markAsExpired(@Param('id') id: number) {
    return this.userCouponsService.markAsExpired(id);
  }
}

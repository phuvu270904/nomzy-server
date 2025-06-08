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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/role.enum';

@ApiBearerAuth('access-token')
@ApiTags('Coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() createCouponDto: CreateCouponDto) {
    return this.couponsService.create(createCouponDto);
  }

  @Get()
  @Roles(Role.ADMIN)
  async findAll() {
    return this.couponsService.findAll();
  }

  @Get('global')
  async findAllGlobal() {
    return this.couponsService.findAllGlobal();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.couponsService.findOne(id);
  }

  @Get('code/:code')
  async findByCode(@Param('code') code: string) {
    return this.couponsService.findByCode(code);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  async update(
    @Param('id') id: number,
    @Body() updateCouponDto: UpdateCouponDto,
  ) {
    return this.couponsService.update(id, updateCouponDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: number) {
    return this.couponsService.remove(id);
  }

  @Put(':id/deactivate')
  @Roles(Role.ADMIN)
  async deactivate(@Param('id') id: number) {
    return this.couponsService.deactivate(id);
  }
}

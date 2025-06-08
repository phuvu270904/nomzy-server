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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/role.enum';

@ApiBearerAuth('access-token')
@ApiTags('Coupon Sent')
@Controller('coupon-sent')
@Roles(Role.ADMIN)
export class CouponSentController {
  constructor(private readonly couponSentService: CouponSentService) {}

  @Post()
  async create(@Body() createCouponSentDto: CreateCouponSentDto) {
    return this.couponSentService.create(createCouponSentDto);
  }

  @Get()
  async findAll() {
    return this.couponSentService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.couponSentService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateCouponSentDto: UpdateCouponSentDto,
  ) {
    return this.couponSentService.update(id, updateCouponSentDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.couponSentService.remove(id);
  }
}

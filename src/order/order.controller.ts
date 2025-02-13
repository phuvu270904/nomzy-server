import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  createOrder(@Body() body: any) {
    return this.orderService.createOrder(body);
  }

  @Get()
  findOrders() {
    return this.orderService.findOrders();
  }

  @Get(':id')
  findOrder(@Param('id') _id: string) {
    return this.orderService.findOrder(_id);
  }

  @Put(':id')
  updateOrder(@Param('id') _id: string, @Body() body: any) {
    return this.orderService.updateOrder(_id, body);
  }

  @Delete(':id')
  deleteOrder(@Param('id') _id: string) {
    return this.orderService.deleteOrder(_id);
  }
}

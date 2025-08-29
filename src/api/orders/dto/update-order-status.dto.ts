import { IsEnum, IsNumber } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

export class UpdateOrderStatusDto {
  @IsNumber()
  orderId: number;

  @IsEnum(OrderStatus)
  status: OrderStatus;
}

import { IsEnum } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus, description: 'The new status of the order' })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

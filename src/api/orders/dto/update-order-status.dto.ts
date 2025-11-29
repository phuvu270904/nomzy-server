import { IsEnum } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrderStatusDto {
  @ApiProperty({ 
    enum: OrderStatus, 
    description: 'The new status of the order. Status flow: pending → confirmed → preparing → ready_for_pickup → out_for_delivery → delivered. Can be cancelled at any stage.',
    example: OrderStatus.CONFIRMED,
    enumName: 'OrderStatus',
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

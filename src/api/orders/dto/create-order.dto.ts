import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaymentMethod } from '../entities/order.entity';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Address ID for delivery',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  addressId: number;

  @ApiProperty({
    description: 'Payment method',
    example: PaymentMethod.CASH_ON_DELIVERY,
    enum: PaymentMethod,
  })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Optional coupon code from user coupon to apply',
    example: '1',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  couponId?: number;

  @ApiProperty({
    description: 'Additional notes for the order',
    example: 'Please ring the doorbell twice',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: 'Restaurant ID',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  restaurantId: number;
}

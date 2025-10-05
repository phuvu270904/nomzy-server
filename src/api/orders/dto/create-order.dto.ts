import {
  IsNumber,
  IsArray,
  IsOptional,
  IsEnum,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '../entities/order.entity';

export class CreateOrderItemDto {
  @ApiProperty({
    description: 'ID of the product being ordered',
    example: 15,
    type: Number,
  })
  @IsNumber()
  productId: number;

  @ApiProperty({
    description: 'Quantity of the product',
    example: 2,
    minimum: 1,
    type: Number,
  })
  @IsNumber()
  quantity: number;

  @ApiProperty({
    description: 'Unit price of the product in dollars',
    example: 12.99,
    type: Number,
  })
  @IsNumber()
  unitPrice: number;

  @ApiProperty({
    description: 'Discount amount applied to this item',
    example: 1.5,
    required: false,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  discount?: number;

  @ApiProperty({
    description: 'Subtotal for this item (quantity * unitPrice - discount)',
    example: 24.48,
    type: Number,
  })
  @IsNumber()
  subtotal: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'ID of the user placing the order',
    example: 123,
    type: Number,
  })
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: 'ID of the restaurant receiving the order',
    example: 456,
    type: Number,
  })
  @IsNumber()
  restaurantId: number;

  @ApiProperty({
    description: 'ID of the delivery address',
    example: 789,
    type: Number,
  })
  @IsNumber()
  addressId: number;

  @ApiProperty({
    description: 'Array of items being ordered',
    type: [CreateOrderItemDto],
    example: [
      {
        productId: 15,
        quantity: 2,
        unitPrice: 12.99,
        discount: 1.5,
        subtotal: 24.48,
      },
      {
        productId: 22,
        quantity: 1,
        unitPrice: 8.99,
        subtotal: 8.99,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  orderItems: CreateOrderItemDto[];

  @ApiProperty({
    description:
      'Subtotal of all items before delivery fee and final discounts',
    example: 33.47,
    type: Number,
  })
  @IsNumber()
  subtotal: number;

  @ApiProperty({
    description: 'Delivery fee in dollars',
    example: 3.99,
    type: Number,
  })
  @IsNumber()
  deliveryFee: number;

  @ApiProperty({
    description: 'Order-level discount amount',
    example: 2.0,
    required: false,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  discount?: number;

  @ApiProperty({
    description: 'Final total amount (subtotal + deliveryFee - discount)',
    example: 35.46,
    type: Number,
  })
  @IsNumber()
  total: number;

  @ApiProperty({
    description: 'ID of the coupon applied to this order',
    example: 15,
    required: false,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  couponId?: number;

  @ApiProperty({
    description: 'Payment method for the order',
    enum: PaymentMethod,
    example: PaymentMethod.CASH_ON_DELIVERY,
    enumName: 'PaymentMethod',
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Special instructions or notes for the order',
    example: 'Please ring the doorbell twice. Leave at door if no answer.',
    required: false,
    maxLength: 500,
    type: String,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

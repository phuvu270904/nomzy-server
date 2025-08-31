import {
  IsNumber,
  IsArray,
  IsOptional,
  IsEnum,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../entities/order.entity';

export class CreateOrderItemDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitPrice: number;

  @IsNumber()
  @IsOptional()
  discount?: number;

  @IsNumber()
  subtotal: number;
}

export class CreateOrderDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  restaurantId: number;

  @IsNumber()
  addressId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  orderItems: CreateOrderItemDto[];

  @IsNumber()
  subtotal: number;

  @IsNumber()
  deliveryFee: number;

  @IsNumber()
  @IsOptional()
  discount?: number;

  @IsNumber()
  total: number;

  @IsNumber()
  @IsOptional()
  couponId?: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsString()
  @IsOptional()
  notes?: string;
}

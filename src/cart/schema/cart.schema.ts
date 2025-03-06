import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { Product } from 'src/product/schema/product.schema';
import { Restaurant } from 'src/restaurant/schema/restaurant.schema';

@Schema({ timestamps: true })
export class Cart {
  @Prop({ required: true })
  @IsNumber()
  quantity: number;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  @IsNumber()
  user: number;

  @Prop({ required: true })
  @IsNumber()
  price: number;

  @Prop()
  @IsString()
  @IsOptional()
  note?: string;

  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
  restaurantId: Types.ObjectId;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsOptional } from 'class-validator';
import { Types } from 'mongoose';
import { Product } from 'src/product/schema/product.schema';
import { Restaurant } from 'src/restaurant/schema/restaurant.schema';

@Schema({ timestamps: true })
export class Cart {
  @Prop({ required: true })
  quantity: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Product' }], required: true })
  productId: Product;

  @Prop({ required: true })
  user: number;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  @IsOptional()
  note?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Restaurant' }], required: true })
  restaurantId: Restaurant;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

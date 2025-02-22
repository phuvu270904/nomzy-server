import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Cart } from 'src/cart/schema/cart.schema';
import { Restaurant } from 'src/restaurant/schema/restaurant.schema';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Restaurant' })
  restaurantId: Restaurant;

  @Prop({ required: true, type: Number })
  createdBy: number;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Cart' })
  items: Cart[];

  @Prop({ required: true })
  total: number;

  @Prop({
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'canceled'],
    default: 'pending',
  })
  status: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

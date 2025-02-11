import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Product } from 'src/product/schema/product.schema';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Restaurant' })
  restaurant: Types.ObjectId;

  @Prop({ required: true, type: Number })
  createdBy: number;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Product' })
  items: Product[];

  @Prop({ required: true })
  totalAmount: number;

  @Prop({
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'canceled'],
    default: 'pending',
  })
  status: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

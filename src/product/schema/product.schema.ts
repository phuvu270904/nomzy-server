import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Restaurant } from 'src/restaurant/schema/restaurant.schema';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Restaurant' })
  restaurant: Restaurant;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

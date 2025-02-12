import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Document, Types } from 'mongoose';
import { Product } from 'src/product/schema/product.schema';

export type RestaurantDocument = Restaurant & Document;

@Schema({ timestamps: true })
export class Restaurant {
  @Prop({ required: true })
  @IsString()
  name: string;

  @Prop({ required: true })
  @IsString()
  location: string;

  @Prop({ required: true })
  @IsString()
  phone_number: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Product' }] })
  @IsOptional()
  products?: Product[];

  @Prop({ required: true })
  @IsNumber()
  owner: number;
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);

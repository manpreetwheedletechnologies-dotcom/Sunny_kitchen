import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ default: "🍽️" })
  emoji: string;

  @Prop({ default: null })
  imageUrl?: string;

  @Prop({ default: 0, min: 0 })
  stockCount: number;

  @Prop({ default: false })
  outOfStock: boolean;

  @Prop({ default: false })
  isCombo: boolean;

  // Optional display order number, matches the numbered menu grid on the site.
  @Prop({ default: 0 })
  sortOrder: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type TestimonialDocument = Testimonial & Document;

@Schema({ timestamps: true })
export class Testimonial {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const TestimonialSchema = SchemaFactory.createForClass(Testimonial);

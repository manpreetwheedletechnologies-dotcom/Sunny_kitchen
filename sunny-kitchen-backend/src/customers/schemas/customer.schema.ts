import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { OrderSource } from "../../orders/schemas/order.schema";

export type CustomerDocument = Customer & Document;

@Schema({ timestamps: true })
export class Customer {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  phone: string;

  @Prop()
  email?: string;

  @Prop()
  address?: string;

  @Prop({ default: 0 })
  totalOrders: number;

  @Prop({ type: Date })
  lastOrderDate?: Date;

  @Prop({
    type: String,
    enum: Object.values(OrderSource),
    default: OrderSource.WEBSITE,
  })
  preferredPlatform: OrderSource;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

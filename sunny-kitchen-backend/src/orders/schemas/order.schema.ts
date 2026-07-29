import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type OrderDocument = Order & Document;

export enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  PREPARING = "preparing",
  OUT_FOR_DELIVERY = "out_for_delivery",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

export enum PaymentStatus {
  PENDING = "Pending",
  USER_DONE = "User_Done",
  USER_NOT_DONE = "User_Not_Done",
  CONFIRMED = "Confirmed",
}

export enum OrderSource {
  WEBSITE = "website",
  SWIGGY = "swiggy",
  ZOMATO = "zomato",
}

@Schema()
export class OrderLine {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  qty: number;
}
export const OrderLineSchema = SchemaFactory.createForClass(OrderLine);

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, unique: true })
  orderNumber: string;

  @Prop({ required: true })
  customerName: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  email?: string;

  @Prop({ required: true })
  address: string;

  @Prop()
  notes?: string;

  @Prop({ type: [OrderLineSchema], required: true })
  items: OrderLine[];

  @Prop({ required: true })
  subtotal: number;

  @Prop({ required: true, default: 0 })
  deliveryFee: number;

  @Prop({ required: true })
  total: number;

  @Prop({ required: true, enum: ["cod", "upi"] })
  paymentMethod: string;

  @Prop()
  discountCode?: string;

  @Prop({ default: 0 })
  discountAmount?: number;

  @Prop({
    required: true,
    enum: Object.values(OrderStatus),
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Prop({
    required: true,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Prop({
    required: true,
    enum: Object.values(OrderSource),
    default: OrderSource.WEBSITE,
  })
  source: OrderSource;

  // Razorpay tracking fields
  @Prop()
  razorpayOrderId?: string;

  @Prop()
  razorpayPaymentId?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

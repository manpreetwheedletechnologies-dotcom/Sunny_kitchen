import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type PaymentStatusValue = "created" | "captured" | "failed";

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  // Reference to the order this payment belongs to.
  @Prop({ type: Types.ObjectId, ref: "Order", required: true, index: true })
  order: Types.ObjectId;

  // Denormalized for quick display in the dashboard without a join.
  @Prop({ required: true })
  orderNumber: string;

  @Prop({ required: true, index: true })
  razorpayOrderId: string;

  @Prop()
  razorpayPaymentId?: string;

  // Stored in rupees (not paise) so it's directly readable in the dashboard.
  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, default: "INR" })
  currency: string;

  @Prop({
    required: true,
    enum: ["created", "captured", "failed"],
    default: "created",
  })
  status: PaymentStatusValue;

  // Which instrument the customer actually used: upi, card, netbanking, wallet
  @Prop()
  method?: string;

  @Prop()
  contact?: string;

  @Prop()
  email?: string;

  // Populated only when status is "failed"
  @Prop()
  errorCode?: string;

  @Prop()
  errorReason?: string;

  @Prop()
  errorDescription?: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

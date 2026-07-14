import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type LeadStatus = "New" | "Contacted" | "Qualified" | "Closed";

@Schema({ timestamps: true })
export class Lead extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  contactInfo: string;

  @Prop({ required: true })
  message: string;

  @Prop({ default: "New", enum: ["New", "Contacted", "Qualified", "Closed"] })
  status: LeadStatus;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);

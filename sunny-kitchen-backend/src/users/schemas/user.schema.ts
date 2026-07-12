import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type UserDocument = User & Document;

export enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
  STAFF = "staff",
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop()
  mobile?: string;

  @Prop()
  profilePictureUrl?: string;

  @Prop({
    required: true,
    enum: Object.values(UserRole),
    default: UserRole.STAFF,
  })
  role: UserRole;

  @Prop({ type: Object, default: {} })
  permissions: {
    dashboard?: boolean;
    orders?: boolean;
    menu?: boolean;
    swiggy?: boolean;
    zomato?: boolean;
    customers?: boolean;
    users?: boolean;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);

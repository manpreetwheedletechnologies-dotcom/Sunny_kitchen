import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";
import { OrderSource, PaymentStatus } from "../schemas/order.schema";

export class OrderItemDto {
  @IsString()
  productId: string;

  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(1)
  qty: number;
}

export class CreateOrderDto {
  @IsString()
  @MinLength(2)
  customerName: string;

  @IsString()
  @MinLength(7)
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @MinLength(5)
  address: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsIn(["cod", "upi"])
  paymentMethod: "cod" | "upi";

  @IsOptional()
  @IsString()
  discountCode?: string;

  @IsOptional()
  @IsIn(Object.values(OrderSource))
  source?: OrderSource;

  @IsOptional()
  @IsIn(Object.values(PaymentStatus))
  paymentStatus?: PaymentStatus;
}

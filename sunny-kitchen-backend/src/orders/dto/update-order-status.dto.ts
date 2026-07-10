import { IsIn } from "class-validator";
import { OrderStatus } from "../schemas/order.schema";

export class UpdateOrderStatusDto {
  @IsIn(Object.values(OrderStatus))
  status: OrderStatus;
}

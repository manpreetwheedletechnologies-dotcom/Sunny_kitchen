import { IsIn } from "class-validator";
import { PaymentStatus } from "../schemas/order.schema";

export class UpdatePaymentStatusDto {
  @IsIn(Object.values(PaymentStatus))
  paymentStatus: PaymentStatus;
}

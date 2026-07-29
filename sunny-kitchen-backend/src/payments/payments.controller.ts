import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { AdminGuard } from "../auth/admin.guard";

@Controller("payments")
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  // Admin-only — powers the Payments dashboard page.
  // Pass ?orderId=... to see payment attempts for one specific order.
  @UseGuards(AdminGuard)
  @Get()
  findAll(@Query("orderId") orderId?: string) {
    return this.paymentsService.findAll(orderId);
  }
}

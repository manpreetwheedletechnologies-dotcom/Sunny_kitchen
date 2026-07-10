import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { AdminGuard } from "../auth/admin.guard";
import { OrderStatus } from "./schemas/order.schema";

@Controller("orders")
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  // Public — this is how the storefront checkout submits a new order.
  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  // Everything below is admin-only — this is the "incoming orders" feed.
  @UseGuards(AdminGuard)
  @Get()
  findAll(@Query("status") status?: OrderStatus) {
    return this.ordersService.findAll(status);
  }

  @UseGuards(AdminGuard)
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.ordersService.findOne(id);
  }

  @UseGuards(AdminGuard)
  @Patch(":id/status")
  updateStatus(@Param("id") id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto.status);
  }
}

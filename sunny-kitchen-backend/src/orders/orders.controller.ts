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
import { OrderStatus, OrderSource } from "./schemas/order.schema";

@Controller("orders")
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  // Public — this is how the storefront checkout submits a new order.
  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Post("seed")
  async seedDummyData() {
    const dummies = [
      {
        customerName: "Rahul Sharma",
        phone: "9876543210",
        address: "123, MG Road, Bangalore",
        items: [{ name: "Paneer Tikka", price: 250, qty: 2 }],
        total: 500,
        paymentMethod: "upi",
        deliveryFee: 40,
        source: "swiggy" as OrderSource,
      },
      {
        customerName: "Priya Singh",
        phone: "8765432109",
        address: "45, Koramangala, Bangalore",
        items: [{ name: "Butter Chicken", price: 350, qty: 1 }, { name: "Naan", price: 40, qty: 3 }],
        total: 470,
        paymentMethod: "cod",
        deliveryFee: 50,
        source: "zomato" as OrderSource,
      },
      {
        customerName: "Amit Kumar",
        phone: "7654321098",
        address: "Sector 4, HSR Layout",
        items: [{ name: "Veg Biryani", price: 200, qty: 2 }],
        total: 400,
        paymentMethod: "upi",
        deliveryFee: 30,
        source: "swiggy" as OrderSource,
      },
      {
        customerName: "Neha Gupta",
        phone: "6543210987",
        address: "Indiranagar 2nd Stage",
        items: [{ name: "Dal Makhani", price: 180, qty: 1 }],
        total: 180,
        paymentMethod: "upi",
        deliveryFee: 40,
        source: "zomato" as OrderSource,
      }
    ];

    for (const data of dummies) {
      await this.ordersService.create(data as any);
    }
    return { success: true, message: "Seeded 4 dummy orders." };
  }

  @UseGuards(AdminGuard)
  @Get("analytics")
  getAnalytics() {
    return this.ordersService.getAnalytics();
  }

  // Everything below is admin-only — this is the "incoming orders" feed.
  @UseGuards(AdminGuard)
  @Get()
  findAll(
    @Query("status") status?: OrderStatus,
    @Query("source") source?: OrderSource,
    @Query("search") search?: string
  ) {
    return this.ordersService.findAll(status, source, search);
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

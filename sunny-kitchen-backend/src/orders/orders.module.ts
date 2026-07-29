import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Order, OrderSchema } from "./schemas/order.schema";
import { OrdersService } from "./orders.service";
import { OrdersController } from "./orders.controller";
import { AuthModule } from "../auth/auth.module";
import { ProductsModule } from "../products/products.module";
import { MailModule } from "../mail/mail.module";
import { CustomersModule } from "../customers/customers.module";
import { LeadsModule } from "../leads/leads.module";
import { PaymentsModule } from "../payments/payments.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    AuthModule,
    ProductsModule,
    MailModule,
    CustomersModule,
    LeadsModule,
    PaymentsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}

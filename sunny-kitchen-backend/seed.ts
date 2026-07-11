import { NestFactory } from "@nestjs/core";
import { AppModule } from "./src/app.module";
import { OrdersService } from "./src/orders/orders.service";
import { ProductsService } from "./src/products/products.service";
import { OrderSource } from "./src/orders/schemas/order.schema";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const ordersService = app.get(OrdersService);
  const productsService = app.get(ProductsService);

  const allProducts = await productsService.findAll();
  
  if (allProducts.length === 0) {
    console.error("No products found in DB! Cannot seed orders. Add products via Menu first.");
    await app.close();
    return;
  }

  const dummies = [
    {
      customerName: "Rahul Sharma",
      phone: "9876543210",
      address: "123, MG Road, Bangalore",
      items: [{ productId: allProducts[0]._id, qty: 2 }],
      paymentMethod: "upi",
      source: "swiggy" as OrderSource,
    },
    {
      customerName: "Priya Singh",
      phone: "8765432109",
      address: "45, Koramangala, Bangalore",
      items: [
        { productId: allProducts[0]._id, qty: 1 },
        ...(allProducts.length > 1 ? [{ productId: allProducts[1]._id, qty: 3 }] : [])
      ],
      paymentMethod: "cod",
      source: "zomato" as OrderSource,
    },
    {
      customerName: "Amit Kumar",
      phone: "7654321098",
      address: "Sector 4, HSR Layout",
      items: [{ productId: allProducts[allProducts.length - 1]._id, qty: 2 }],
      paymentMethod: "upi",
      source: "swiggy" as OrderSource,
    },
    {
      customerName: "Neha Gupta",
      phone: "6543210987",
      address: "Indiranagar 2nd Stage",
      items: [{ productId: allProducts[0]._id, qty: 1 }],
      paymentMethod: "upi",
      source: "zomato" as OrderSource,
    }
  ];

  console.log("Seeding orders...");
  for (const data of dummies) {
    try {
      await ordersService.create(data as any);
    } catch (e: any) {
      console.error(`Failed to create order for ${data.customerName}:`, e.message);
    }
  }
  console.log("Successfully ran seed script.");

  await app.close();
}
bootstrap();

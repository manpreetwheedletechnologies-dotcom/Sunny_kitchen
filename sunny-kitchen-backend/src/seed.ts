/**
 * Run with: npm run seed
 * Populates the database with the starting Sunny's Kitchen menu.
 * Safe to re-run — it clears the products collection first.
 */
import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { Product, ProductSchema } from "./products/schemas/product.schema";

const products = [
  { name: "Cheese sandwich", price: 109, emoji: "🥪", stockCount: 25, sortOrder: 1 },
  { name: "Aloo fries", price: 59, emoji: "🍟", stockCount: 40, sortOrder: 2 },
  { name: "Peri peri paneer sandwich", price: 169, emoji: "🥪", stockCount: 20, sortOrder: 3 },
  { name: "Red sauce pasta", price: 149, emoji: "🍝", stockCount: 20, sortOrder: 4 },
  { name: "White sauce pasta", price: 149, emoji: "🍝", stockCount: 20, sortOrder: 5 },
  { name: "Masala omlette with bread slice", price: 99, emoji: "🍳", stockCount: 30, sortOrder: 6 },
  { name: "Vermicelli upma", price: 109, emoji: "🍜", stockCount: 25, sortOrder: 7 },
  { name: "Aloo pratha 2 pc.", price: 89, emoji: "🫓", stockCount: 25, sortOrder: 8 },
  { name: "Khichdi with curd", price: 139, emoji: "🥣", stockCount: 20, sortOrder: 9 },
  { name: "Masala daliya / Milk daliya", price: 89, emoji: "🥣", stockCount: 20, sortOrder: 10 },
  {
    name: "Veg cheese sandwich + Aloo fries",
    price: 159,
    emoji: "🥪",
    stockCount: 15,
    isCombo: true,
    sortOrder: 11,
  },
];

async function run() {
  const uri = process.env.MONGODB_URI ?? "mongodb://localhost:27017/sunnyskitchen";
  await mongoose.connect(uri);
  const ProductModel = mongoose.model(Product.name, ProductSchema);

  await ProductModel.deleteMany({});
  await ProductModel.insertMany(products);

  // eslint-disable-next-line no-console
  console.log(`Seeded ${products.length} products into ${uri}`);
  await mongoose.disconnect();
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type ProductDocument = Product & Document;

/** Allowed qualitative levels for the macro columns (matches the nutrition sheet). */
export const NUTRITION_LEVELS = ["None", "Very low", "Low", "Moderate", "High"];

/**
 * One food inside a "Meal Nutrition" combo (one row of the nutrition sheet):
 * Food Item | Protein | Carbs | Healthy Fats | Fiber | Vitamins & Minerals | Main Benefit
 */
@Schema({ _id: false })
export class NutritionItem {
  @Prop({ required: true })
  foodItem: string;

  @Prop({ default: "🍽️" })
  emoji: string;

  @Prop({ default: "Low" })
  protein: string;

  @Prop({ default: "Low" })
  carbs: string;

  @Prop({ default: "Low" })
  healthyFats: string;

  @Prop({ default: "Low" })
  fiber: string;

  // Free text, e.g. "High (vitamin C, A)"
  @Prop({ default: "" })
  vitamins: string;

  // Free text, e.g. "Hydration + energy"
  @Prop({ default: "" })
  benefit: string;
}

export const NutritionItemSchema = SchemaFactory.createForClass(NutritionItem);

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ default: "🍽️" })
  emoji: string;

  @Prop({ default: null })
  imageUrl?: string;

  @Prop({ default: 0, min: 0 })
  stockCount: number;

  @Prop({ default: false })
  outOfStock: boolean;

  @Prop({ default: false })
  isCombo: boolean;

  @Prop({ default: "Uncategorized" })
  category: string;

  // Optional display order number, matches the numbered menu grid on the site.
  @Prop({ default: 0 })
  sortOrder: number;

  @Prop({ default: "" })
  ingredients: string;

  // true => shown in the separate "Meal Nutrition" section of the site
  // (NOT in the normal menu grid / combo deals). Such items carry a
  // per-food nutrition breakdown in `nutrition`.
  @Prop({ default: false })
  isNutritionMeal: boolean;

  @Prop({ type: [NutritionItemSchema], default: [] })
  nutrition: NutritionItem[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);

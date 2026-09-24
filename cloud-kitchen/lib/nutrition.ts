import type { NutritionItem, NutritionLevel, Product } from "./api";

export const LEVELS: NutritionLevel[] = ["None", "Very low", "Low", "Moderate", "High"];

/** 0 (none) … 4 (high) — used for the meters and the "meal balance" bars. */
export function levelScore(level: string | undefined): number {
  const i = LEVELS.findIndex((l) => l.toLowerCase() === String(level ?? "").trim().toLowerCase());
  return i === -1 ? 0 : i;
}

export type NutrientKey = "protein" | "carbs" | "healthyFats" | "fiber";

export const NUTRIENTS: {
  key: NutrientKey;
  label: string;
  emoji: string;
  bar: string; // tailwind bg class for the filled part
  text: string;
}[] = [
  { key: "protein", label: "Protein", emoji: "💪", bar: "bg-tomato", text: "text-tomato" },
  { key: "carbs", label: "Carbs", emoji: "⚡", bar: "bg-sunDeep", text: "text-sunDeep" },
  { key: "healthyFats", label: "Healthy Fats", emoji: "🥑", bar: "bg-emerald-500", text: "text-emerald-600" },
  { key: "fiber", label: "Fiber", emoji: "🌾", bar: "bg-forest", text: "text-forest" },
];

/** Products that belong to the separate Meal Nutrition section. */
export function isNutritionMeal(p: Product): boolean {
  return !!p.isNutritionMeal;
}

/** Average level per nutrient across all foods of a meal (0-4). */
export function mealBalance(items: NutritionItem[]) {
  return NUTRIENTS.map((n) => {
    const avg = items.length
      ? items.reduce((sum, it) => sum + levelScore(it[n.key]), 0) / items.length
      : 0;
    return { ...n, avg, label2: LEVELS[Math.round(avg)] };
  });
}

/** Friendly auto-generated highlight chips for a meal. */
export function mealHighlights(items: NutritionItem[]): string[] {
  if (!items.length) return [];
  const out: string[] = [];
  const avg = (k: NutrientKey) =>
    items.reduce((s, it) => s + levelScore(it[k]), 0) / items.length;

  if (items.some((it) => levelScore(it.protein) >= 4)) out.push("💪 Protein boost");
  else if (items.some((it) => levelScore(it.protein) >= 3)) out.push("💪 Good protein");
  if (avg("fiber") >= 2.5) out.push("🌾 Fiber-rich");
  if (avg("healthyFats") <= 1.5 && avg("carbs") <= 3.5) out.push("🪶 Light on fats");
  const vitaminRich = items.filter((it) => /^\s*high/i.test(it.vitamins || "")).length;
  if (vitaminRich >= Math.ceil(items.length / 2)) out.push("🍊 Vitamin-packed");
  if (items.some((it) => /hydrat/i.test(it.benefit || ""))) out.push("💧 Hydrating");
  return out.slice(0, 5);
}

const F = (
  foodItem: string,
  emoji: string,
  protein: NutritionLevel,
  carbs: NutritionLevel,
  healthyFats: NutritionLevel,
  fiber: NutritionLevel,
  vitamins: string,
  benefit: string
): NutritionItem => ({ foodItem, emoji, protein, carbs, healthyFats, fiber, vitamins, benefit });

/**
 * Ready-made foods from the Sunny's Kitchen nutrition sheet.
 * The admin can quick-add these (and edit every value) instead of typing.
 */
export const NUTRITION_LIBRARY: NutritionItem[] = [
  F("Watermelon", "🍉", "Low", "High", "Very low", "Moderate", "High (vitamin C, A)", "Hydration + energy"),
  F("Pineapple", "🍍", "Low", "High", "Very low", "Moderate", "High (vitamin C)", "Energy + digestion"),
  F("Cucumber", "🥒", "Low", "Low", "Very low", "Moderate", "Some vitamin K", "Hydration + digestion"),
  F("Carrot", "🥕", "Low", "Moderate", "Very low", "High", "High (beta-carotene/vitamin A)", "Eye health + fiber"),
  F("Green peas / sprouts", "🌱", "Moderate", "Moderate", "Low", "High", "Folate + vitamin K", "Protein + fullness"),
  F("Boiled egg", "🥚", "High", "Very low", "Moderate", "None", "B12, choline, selenium", "Complete protein + satiety"),
];

const lib = (name: string) => NUTRITION_LIBRARY.find((f) => f.foodItem === name)!;

/** One-click templates for the two combos in the sheet. */
export const NUTRITION_TEMPLATES: { label: string; items: NutritionItem[] }[] = [
  {
    label: "Combo 1 template",
    items: ["Watermelon", "Pineapple", "Cucumber", "Carrot", "Green peas / sprouts"].map(lib),
  },
  {
    label: "Combo 2 template",
    items: [
      "Watermelon",
      "Pineapple",
      "Cucumber",
      "Carrot",
      "Green peas / sprouts",
      "Boiled egg",
    ].map(lib),
  },
];

export const BLANK_FOOD: NutritionItem = {
  foodItem: "",
  emoji: "🥗",
  protein: "Low",
  carbs: "Low",
  healthyFats: "Low",
  fiber: "Low",
  vitamins: "",
  benefit: "",
};

/* ------------------------------------------------------------------ */
/* Paste-from-Excel support                                            */
/* ------------------------------------------------------------------ */

/** Column order of the nutrition sheet (tab separated when copied from Excel/Sheets). */
export const SHEET_COLUMNS =
  "Meal / Image | Food Item | Protein | Carbohydrates | Healthy Fats | Fiber | Vitamins & Minerals | Main Benefit";

function normalizeLevel(raw: string): NutritionLevel {
  const v = raw.trim().toLowerCase();
  if (["0", "none", "nil", "-", "—", "na", "n/a", ""].includes(v)) return "None";
  if (v.startsWith("very")) return "Very low";
  if (v.startsWith("low")) return "Low";
  if (v.startsWith("mod") || v.startsWith("med")) return "Moderate";
  if (v.startsWith("high")) return "High";
  return "Low";
}

function guessEmoji(food: string): string {
  const f = food.toLowerCase();
  const hit = NUTRITION_LIBRARY.find(
    (x) => x.foodItem.toLowerCase() === f || f.includes(x.foodItem.toLowerCase().split(/[ /]/)[0])
  );
  return hit?.emoji ?? "🥗";
}

const unquote = (s: string) => s.trim().replace(/^"([\s\S]*)"$/, "$1").trim();

export type PastedMeals = { order: string[]; meals: Record<string, NutritionItem[]> };

/**
 * Parses rows copied from the sheet (tab separated). Accepts either
 * 8 columns (with the Meal column) or 7 columns (without it). A header row
 * is skipped automatically. Returns foods grouped by meal name.
 */
export function parseNutritionPaste(text: string): PastedMeals | { error: string } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return { error: "Kuch paste nahi hua." };
  if (!lines.some((l) => l.includes("\t")))
    return {
      error:
        "Tab-separated data nahi mila. Excel/Google Sheets me rows select karke copy karo (Ctrl+C) aur yahan paste karo.",
    };

  const order: string[] = [];
  const meals: Record<string, NutritionItem[]> = {};

  for (const line of lines) {
    const cells = line.split("\t").map(unquote);
    if (cells.some((c) => /^food item$/i.test(c))) continue; // header row
    const hasMeal = cells.length >= 8;
    const off = hasMeal ? 1 : 0;
    const meal = hasMeal ? cells[0] || "Pasted" : "Pasted";
    const food = cells[off];
    if (!food) continue;
    const item: NutritionItem = {
      foodItem: food,
      emoji: guessEmoji(food),
      protein: normalizeLevel(cells[off + 1] ?? ""),
      carbs: normalizeLevel(cells[off + 2] ?? ""),
      healthyFats: normalizeLevel(cells[off + 3] ?? ""),
      fiber: normalizeLevel(cells[off + 4] ?? ""),
      vitamins: cells[off + 5] ?? "",
      benefit: cells[off + 6] ?? "",
    };
    if (!meals[meal]) {
      meals[meal] = [];
      order.push(meal);
    }
    meals[meal].push(item);
  }

  if (order.length === 0)
    return { error: "Koi valid row nahi mili. Columns ka order check karo." };
  return { order, meals };
}

/** The sheet you shared, ready to test the paste box with one click. */
export const SAMPLE_SHEET = [
  ["Combo 1", "Watermelon", "Low", "High", "Very low", "Moderate", "High (vitamin C, A)", "Hydration + energy"],
  ["Combo 1", "Pineapple", "Low", "High", "Very low", "Moderate", "High (vitamin C)", "Energy + digestion"],
  ["Combo 1", "Cucumber", "Low", "Low", "Very low", "Moderate", "Some vitamin K", "Hydration + digestion"],
  ["Combo 1", "Carrot", "Low", "Moderate", "Very low", "High", "High (beta-carotene/vitamin A)", "Eye health + fiber"],
  ["Combo 1", "Green peas / sprouts", "Moderate", "Moderate", "Low", "High", "Folate + vitamin K", "Protein + fullness"],
  ["Combo 2", "Watermelon", "Low", "High", "Very low", "Moderate", "High (vitamin C, A)", "Hydration + energy"],
  ["Combo 2", "Pineapple", "Low", "High", "Very low", "Moderate", "High (vitamin C)", "Energy + digestion"],
  ["Combo 2", "Cucumber", "Low", "Low", "Very low", "Moderate", "Some vitamin K", "Hydration + digestion"],
  ["Combo 2", "Carrot", "Low", "Moderate", "Very low", "High", "High (beta-carotene/vitamin A)", "Eye health + fiber"],
  ["Combo 2", "Green peas / sprouts", "Moderate", "Moderate", "Low", "High", "Folate + vitamin K", "Protein + fullness"],
  ["Combo 2", "Boiled egg", "High", "Very low", "Moderate", "0", "B12, choline, selenium", "Complete protein + satiety"],
]
  .map((r) => r.join("\t"))
  .join("\n");

import Image from "next/image";
import Link from "next/link";
import { resolveImageUrl, type NutritionItem, type Product } from "@/lib/api";
import {
  LEVELS,
  NUTRIENTS,
  levelScore,
  mealBalance,
  mealHighlights,
} from "@/lib/nutrition";
import AddToCart from "./AddToCart";

/** 4-segment meter: 0 segments = None … 4 segments = High. */
function Meter({ level, barClass }: { level: string; barClass: string }) {
  const score = levelScore(level);
  return (
    <div className="flex gap-0.5" aria-hidden>
      {[1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={`h-1.5 flex-1 rounded-full ${i <= score ? barClass : "bg-forest/10"}`}
        />
      ))}
    </div>
  );
}

/** Colored pill for a level. Intensity scale — darker = more of that nutrient. */
function LevelPill({ level }: { level: string }) {
  const cls: Record<string, string> = {
    None: "bg-forest/5 text-forest/40",
    "Very low": "bg-forest/10 text-forest/70",
    Low: "bg-sun/25 text-forest",
    Moderate: "bg-sun text-forest",
    High: "bg-forest text-cream",
  };
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 font-display text-[11px] font-bold ${
        cls[level] ?? cls.Low
      }`}
    >
      {level}
    </span>
  );
}

/** Excel-style table: Food Item | Protein | Carbs | Healthy Fats | Fiber | Vitamins | Benefit */
function NutritionTable({ foods }: { foods: NutritionItem[] }) {
  return (
    <div className="hidden overflow-x-auto rounded-2xl border border-forest/15 bg-white shadow-sm md:block">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-gradient-to-r from-forest to-forest/90 font-display text-[11px] font-bold uppercase tracking-wider text-cream">
            <th className="px-4 py-3">Food item</th>
            {NUTRIENTS.map((n) => (
              <th key={n.key} className="px-3 py-3 text-center">
                {n.label}
              </th>
            ))}
            <th className="px-4 py-3">Vitamins &amp; minerals</th>
            <th className="px-4 py-3">Main benefit</th>
          </tr>
        </thead>
        <tbody>
          {foods.map((f, i) => (
            <tr
              key={`${f.foodItem}-${i}`}
              className="border-t border-forest/10 transition even:bg-cream/40 hover:bg-sun/15"
            >
              <td className="px-4 py-3">
                <span className="flex items-center gap-2 font-display font-bold text-forest">
                  <span className="text-xl">{f.emoji || "🥗"}</span>
                  {f.foodItem}
                </span>
              </td>
              {NUTRIENTS.map((n) => (
                <td key={n.key} className="px-3 py-3 text-center">
                  <LevelPill level={f[n.key]} />
                </td>
              ))}
              <td className="px-4 py-3 font-body text-xs font-semibold text-forest/80">
                {f.vitamins || "—"}
              </td>
              <td className="px-4 py-3">
                {f.benefit && (
                  <span className="inline-block whitespace-nowrap rounded-full bg-sun/30 px-3 py-1 font-display text-xs font-bold text-forest">
                    ✨ {f.benefit}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FoodCard({ food }: { food: NutritionItem }) {
  return (
    <div className="flex flex-col rounded-2xl border border-forest/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cream text-2xl">
          {food.emoji || "🥗"}
        </span>
        <h4 className="font-display text-base font-bold leading-tight text-forest">
          {food.foodItem}
        </h4>
      </div>

      {food.benefit && (
        <p className="mt-3 inline-flex w-fit items-center gap-1 rounded-full bg-forest px-3 py-1 font-display text-[11px] font-bold uppercase tracking-wide text-cream">
          ✨ {food.benefit}
        </p>
      )}

      <div className="mt-3 space-y-2">
        {NUTRIENTS.map((n) => (
          <div key={n.key}>
            <div className="mb-0.5 flex items-center justify-between font-body text-xs font-semibold text-forest/70">
              <span>
                {n.emoji} {n.label}
              </span>
              <span className={n.text}>{food[n.key]}</span>
            </div>
            <Meter level={food[n.key]} barClass={n.bar} />
          </div>
        ))}
      </div>

      {food.vitamins && (
        <p className="mt-3 rounded-xl bg-sun/20 px-3 py-2 font-body text-xs font-semibold leading-snug text-forest">
          🍊 <span className="font-bold">Vitamins &amp; minerals:</span> {food.vitamins}
        </p>
      )}
    </div>
  );
}

function MealBlock({ meal }: { meal: Product }) {
  const foods = meal.nutrition ?? [];
  const balance = mealBalance(foods);
  const highlights = mealHighlights(foods);
  const img = resolveImageUrl(meal.imageUrl);

  return (
    <article className="overflow-hidden rounded-[2rem] border-2 border-forest/15 bg-card shadow-md">
      {/* Header: photo + title + price */}
      <div className="grid md:grid-cols-[360px_1fr]">
        {/* object-contain => poori image dikhegi, crop nahi hogi */}
        <div className="relative aspect-square w-full bg-gradient-to-br from-sun/30 via-cream to-white md:aspect-auto md:min-h-[380px]">
          {img ? (
            <Image
              src={img}
              alt={meal.name}
              fill
              sizes="(min-width: 768px) 360px, 100vw"
              className="object-contain p-4 drop-shadow-xl"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-7xl">
              {meal.emoji}
            </div>
          )}
          <span className="absolute left-4 top-4 rounded-full bg-forest px-3 py-1 font-display text-[11px] font-bold uppercase tracking-wide text-cream shadow">
            🥗 Meal Nutrition
          </span>
        </div>

        <div className="flex flex-col p-5 md:p-7">
          <h3 className="font-display text-2xl font-extrabold leading-tight text-forest">
            {meal.name}
          </h3>

          {highlights.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {highlights.map((h) => (
                <span
                  key={h}
                  className="rounded-full border border-forest/15 bg-white px-3 py-1 font-display text-xs font-bold text-forest"
                >
                  {h}
                </span>
              ))}
            </div>
          )}

          {/* Meal balance */}
          {foods.length > 0 && (
            <div className="mt-5">
              <p className="font-display text-xs font-bold uppercase tracking-widest text-forest/60">
                Meal balance at a glance
              </p>
              <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-3">
                {balance.map((b) => (
                  <div key={b.key}>
                    <div className="mb-1 flex items-center justify-between font-body text-xs font-bold text-forest">
                      <span>
                        {b.emoji} {b.label}
                      </span>
                      <span className={b.text}>{b.label2}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-forest/10">
                      <div
                        className={`h-full rounded-full ${b.bar} transition-all`}
                        style={{
                          width: `${Math.max(6, (b.avg / (LEVELS.length - 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-dashed border-forest/15 pt-5">
            <div>
              <p className="font-display text-[11px] font-bold uppercase tracking-widest text-forest/50">
                Per plate
              </p>
              <span className="font-display text-3xl font-extrabold text-forest">
                ₹{meal.price}
              </span>
            </div>
            <AddToCart
              id={meal._id}
              name={meal.name}
              price={meal.price}
              emoji={meal.emoji}
              imageUrl={meal.imageUrl}
              outOfStock={meal.outOfStock}
            />
          </div>
        </div>
      </div>

      {/* Per-food breakdown */}
      {foods.length > 0 && (
        <div className="border-t-2 border-dashed border-forest/15 bg-cream/40 p-5 md:p-7">
          <p className="font-display text-sm font-bold text-forest">
            What&apos;s inside · {foods.length} wholesome {foods.length === 1 ? "food" : "foods"}
          </p>
          <div className="mt-4">
            {/* Desktop / tablet: table like the nutrition sheet */}
            <NutritionTable foods={foods} />
            {/* Mobile: one card per food */}
            <div className="grid gap-4 sm:grid-cols-2 md:hidden">
              {foods.map((f, i) => (
                <FoodCard key={`${f.foodItem}-${i}`} food={f} />
              ))}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

export default function MealNutritionSection({
  meals,
  showMenuLink = false,
  limit,
}: {
  meals: Product[];
  showMenuLink?: boolean;
  /** Home page par limit={1} do; Menu page par mat do (sab dikhenge). */
  limit?: number;
}) {
  if (meals.length === 0) return null;

  const shown = limit ? meals.slice(0, limit) : meals;
  const hasMore = shown.length < meals.length;

  return (
    <section id="meal-nutrition" className="mt-14 scroll-mt-36">
      <p className="font-display text-sm font-bold uppercase tracking-widest text-tomato">
        Eat smart · Feel great
      </p>
      <h2 className="mt-1 font-script text-5xl text-forest md:text-6xl">
        Meal Nutrition
      </h2>
      <p className="mt-2 max-w-xl font-body text-forest/70">
        Fresh, wholesome bowls — see exactly what every ingredient does for you.
        Levels are indicative, per serving.
      </p>

      <div className="mt-8 space-y-8">
        {shown.map((m) => (
          <MealBlock key={m._id} meal={m} />
        ))}
      </div>

      {showMenuLink && hasMore && (
        <div className="mt-6 text-center">
          <Link
            href="/menu#meal-nutrition"
            className="focus-ring inline-block rounded-full bg-forest px-6 py-2.5 font-display text-sm font-bold text-cream transition hover:bg-tomato"
          >
            See all {meals.length} combos on Menu →
          </Link>
        </div>
      )}
    </section>
  );
}
import DishPhoto from "./DishPhoto";
import AddToCart from "./AddToCart";
import type { Product } from "@/lib/api";

function Entry({
  item,
  n,
  align,
}: {
  item: Product;
  n: number;
  align: "left" | "right";
}) {
  return (
    <div
      className={`flex flex-1 items-start gap-3 ${
        align === "right" ? "flex-row-reverse text-right" : ""
      }`}
    >
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-forest font-display text-sm font-bold text-cream">
        {n}
      </span>
      <div className={`flex flex-col gap-2 ${align === "right" ? "items-end" : "items-start"}`}>
        <p className="font-display text-base font-semibold leading-tight text-forest md:text-lg">
          {item.name}
          {item.outOfStock && (
            <span className="ml-2 align-middle text-xs font-bold uppercase tracking-wide text-tomato">
              Sold out
            </span>
          )}
        </p>
        <div className={`flex items-center gap-2 ${align === "right" ? "flex-row-reverse" : ""}`}>
          <span className="inline-block rounded-md bg-sun px-3 py-1 font-display text-sm font-bold text-forest">
            ₹{item.price}
          </span>
          <AddToCart
            id={item._id}
            name={item.name}
            price={item.price}
            emoji={item.emoji}
            size="sm"
            outOfStock={item.outOfStock}
          />
        </div>
      </div>
    </div>
  );
}

export default function MenuRow({
  left,
  right,
  leftN,
  rightN,
}: {
  left: Product;
  right: Product | null;
  leftN: number;
  rightN: number | null;
}) {
  return (
    <div className="grid grid-cols-[56px_1fr_2px_1fr_56px] items-center gap-3 border-b border-dashed border-forest/25 py-5 last:border-none sm:grid-cols-[84px_1fr_2px_1fr_84px] sm:gap-5">
      <DishPhoto emoji={left.emoji} imageUrl={left.imageUrl} label={left.name} />
      <Entry item={left} n={leftN} align="left" />
      <div className="self-stretch dashed-divider" />
      {right && rightN ? (
        <>
          <Entry item={right} n={rightN} align="right" />
          <DishPhoto emoji={right.emoji} imageUrl={right.imageUrl} label={right.name} />
        </>
      ) : (
        <>
          <div />
          <div />
        </>
      )}
    </div>
  );
}

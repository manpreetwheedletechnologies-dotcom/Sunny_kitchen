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
  const isRight = align === "right";
  
  return (
    <div
      className={`flex flex-1 items-start gap-3 ${
        isRight ? "md:flex-row-reverse md:text-right" : ""
      }`}
    >
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-forest font-display text-sm font-bold text-cream">
        {n}
      </span>
      <div className={`flex flex-col gap-2 ${isRight ? "md:items-end items-start" : "items-start"}`}>
        <p className="font-display text-base font-semibold leading-tight text-forest md:text-lg">
          {item.name}
          {item.outOfStock && (
            <span className="ml-2 align-middle text-xs font-bold uppercase tracking-wide text-tomato">
              Sold out
            </span>
          )}
        </p>
        <div className={`flex items-center gap-2 ${isRight ? "md:flex-row-reverse" : ""}`}>
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
    <div className="flex flex-col gap-6 border-b border-dashed border-forest/25 py-6 last:border-none md:grid md:grid-cols-[64px_1fr_2px_1fr_64px] md:items-center md:gap-4 lg:grid-cols-[84px_1fr_2px_1fr_84px] lg:gap-5">
      {/* Left Dish */}
      <div className="flex items-center gap-4 md:contents">
        <div className="shrink-0 w-20 md:w-full">
          <DishPhoto emoji={left.emoji} imageUrl={left.imageUrl} label={left.name} />
        </div>
        <Entry item={left} n={leftN} align="left" />
      </div>
      
      {/* Divider */}
      <div className="hidden self-stretch dashed-divider md:block" />
      
      {/* Right Dish */}
      {right && rightN ? (
        <>
          {/* Mobile Divider */}
          <div className="h-px w-full border-b border-dashed border-forest/15 md:hidden" />
          
          <div className="flex items-center gap-4 md:contents">
            {/* Mobile Dish Photo */}
            <div className="shrink-0 w-20 md:hidden">
              <DishPhoto emoji={right.emoji} imageUrl={right.imageUrl} label={right.name} />
            </div>
            
            <Entry item={right} n={rightN} align="right" />
            
            {/* Desktop Dish Photo */}
            <div className="hidden shrink-0 md:block md:w-full">
              <DishPhoto emoji={right.emoji} imageUrl={right.imageUrl} label={right.name} />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="hidden md:block" />
          <div className="hidden md:block" />
        </>
      )}
    </div>
  );
}

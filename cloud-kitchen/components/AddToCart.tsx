"use client";

import { useCart } from "@/lib/cart-context";

export default function AddToCart({
  id,
  name,
  price,
  emoji,
  size = "md",
  outOfStock = false,
}: {
  id: string;
  name: string;
  price: number;
  emoji: string;
  size?: "sm" | "md";
  outOfStock?: boolean;
}) {
  const { getQty, addItem, setQty, ready } = useCart();
  const qty = getQty(id);
  const pad = size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm";

  if (!ready) {
    return (
      <span className={`inline-block rounded-full bg-forest/10 ${pad} font-display font-semibold text-forest/40`}>
        &nbsp;
      </span>
    );
  }

  if (outOfStock) {
    return (
      <span
        className={`inline-block rounded-full bg-forest/10 ${pad} font-display font-bold uppercase tracking-wide text-forest/40`}
      >
        Out of stock
      </span>
    );
  }

  if (qty === 0) {
    return (
      <button
        type="button"
        onClick={() => addItem({ id, name, price, emoji })}
        className={`focus-ring rounded-full bg-forest ${pad} font-display font-bold text-cream transition hover:bg-tomato`}
      >
        Add +
      </button>
    );
  }

  return (
    <div
      className={`focus-ring inline-flex items-center gap-3 rounded-full bg-forest ${pad} font-display font-bold text-cream`}
    >
      <button
        type="button"
        aria-label={`Remove one ${name}`}
        onClick={() => setQty(id, qty - 1)}
        className="focus-ring leading-none"
      >
        −
      </button>
      <span className="min-w-[1ch] text-center">{qty}</span>
      <button
        type="button"
        aria-label={`Add one more ${name}`}
        onClick={() => setQty(id, qty + 1)}
        className="focus-ring leading-none"
      >
        +
      </button>
    </div>
  );
}

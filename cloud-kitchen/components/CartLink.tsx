"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export default function CartLink() {
  const { totalItems } = useCart();

  return (
    <Link
      href="/cart"
      className="focus-ring relative flex items-center gap-2 rounded-full border-2 border-forest px-4 py-2 font-display text-sm font-bold text-forest transition hover:bg-forest hover:text-cream"
      aria-label={`Cart, ${totalItems} item${totalItems === 1 ? "" : "s"}`}
    >
      <span aria-hidden="true">🛍️</span>
      <span className="hidden sm:inline">Cart</span>
      {totalItems > 0 && (
        <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-tomato px-1 text-xs font-bold text-cream">
          {totalItems}
        </span>
      )}
    </Link>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";

export default function CartBar() {
  const { totalItems, subtotal, ready } = useCart();
  const pathname = usePathname();

  if (!ready || totalItems === 0) return null;
  if (pathname === "/cart" || pathname === "/checkout") return null;

  return (
    <div className="sticky bottom-0 z-40 border-t-2 border-forest bg-forest px-5 py-3 md:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <p className="font-display text-sm font-semibold text-cream">
          {totalItems} item{totalItems === 1 ? "" : "s"} · ₹{subtotal}
        </p>
        <Link
          href="/cart"
          className="focus-ring rounded-full bg-sun px-6 py-2 font-display text-sm font-bold text-forest transition hover:bg-cream"
        >
          View Cart
        </Link>
      </div>
    </div>
  );
}

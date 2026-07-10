"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { DELIVERY_FEE, FREE_DELIVERY_ABOVE } from "@/lib/menu";

export default function CartPage() {
  const { lines, subtotal, setQty, removeItem, ready } = useCart();

  const deliveryFee = subtotal === 0 || subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  if (!ready) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-14 md:px-8 md:py-20">
        <p className="font-display text-sm font-semibold text-forest/60">
          Loading your cart…
        </p>
      </main>
    );
  }

  if (lines.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-16 text-center md:px-8 md:py-24">
        <p className="text-5xl">🛍️</p>
        <h1 className="mt-4 font-script text-5xl text-forest md:text-6xl">
          Your cart is empty
        </h1>
        <p className="mt-3 text-forest/70">
          Add something warm and homemade from the menu.
        </p>
        <Link
          href="/menu"
          className="focus-ring mt-8 inline-block rounded-full bg-tomato px-8 py-3 font-display text-sm font-bold text-cream transition hover:bg-forest"
        >
          Browse Menu
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-14 md:px-8 md:py-20">
      <p className="font-display text-sm font-bold uppercase tracking-widest text-tomato">
        Your order
      </p>
      <h1 className="mt-2 font-script text-6xl text-forest md:text-7xl">
        Your Cart
      </h1>

      <div className="mt-8 divide-y divide-forest/10 rounded-3xl border-2 border-forest/15 bg-card px-5 md:px-8">
        {lines.map((line) => (
          <div
            key={line.id}
            className="flex items-center gap-4 py-5"
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sun/40 to-tomato/20 text-2xl">
              {line.emoji}
            </span>
            <div className="flex-1">
              <p className="font-display text-base font-semibold text-forest">
                {line.name}
              </p>
              <p className="font-display text-sm text-forest/60">
                ₹{line.price} each
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-full bg-forest px-4 py-1.5 font-display font-bold text-cream">
              <button
                type="button"
                aria-label={`Remove one ${line.name}`}
                onClick={() => setQty(line.id, line.qty - 1)}
                className="focus-ring leading-none"
              >
                −
              </button>
              <span className="min-w-[1ch] text-center">{line.qty}</span>
              <button
                type="button"
                aria-label={`Add one more ${line.name}`}
                onClick={() => setQty(line.id, line.qty + 1)}
                className="focus-ring leading-none"
              >
                +
              </button>
            </div>
            <p className="w-16 text-right font-display text-sm font-bold text-forest">
              ₹{line.price * line.qty}
            </p>
            <button
              type="button"
              onClick={() => removeItem(line.id)}
              aria-label={`Remove ${line.name} from cart`}
              className="focus-ring text-forest/40 transition hover:text-tomato"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-3xl border-2 border-forest/15 bg-card p-6">
        <div className="flex justify-between font-display text-sm text-forest/80">
          <span>Subtotal</span>
          <span>₹{subtotal}</span>
        </div>
        <div className="mt-2 flex justify-between font-display text-sm text-forest/80">
          <span>Delivery fee</span>
          <span>
            {deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}
          </span>
        </div>
        {deliveryFee > 0 && (
          <p className="mt-2 font-display text-xs text-tomato">
            Add ₹{FREE_DELIVERY_ABOVE - subtotal} more for free delivery
          </p>
        )}
        <div className="mt-4 flex justify-between border-t border-dashed border-forest/25 pt-4 font-display text-lg font-extrabold text-forest">
          <span>Total</span>
          <span>₹{total}</span>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/menu"
            className="focus-ring flex-1 rounded-full border-2 border-forest px-6 py-3 text-center font-display text-sm font-bold text-forest transition hover:bg-forest hover:text-cream"
          >
            Add More Items
          </Link>
          <Link
            href="/checkout"
            className="focus-ring flex-1 rounded-full bg-tomato px-6 py-3 text-center font-display text-sm font-bold text-cream transition hover:bg-forest"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </main>
  );
}

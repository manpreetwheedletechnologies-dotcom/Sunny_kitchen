"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { DELIVERY_FEE, FREE_DELIVERY_ABOVE } from "@/lib/menu";
import { createOrder, getPublicOrder, ApiError, type Order, type PaymentStatus } from "@/lib/api";

type PaymentMethod = "cod" | "upi";

export default function CheckoutPage() {
  const { lines, subtotal, clearCart, ready } = useCart();
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [userPaymentStatus, setUserPaymentStatus] = useState<"User_Done" | "User_Not_Done" | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [pollingStatus, setPollingStatus] = useState<PaymentStatus>("Pending");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [source, setSource] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCoupon = localStorage.getItem("promo_coupon");
      const savedSource = localStorage.getItem("promo_source");
      if (savedCoupon && savedCoupon.toUpperCase() === "DIRECT20") {
        setAppliedCoupon("DIRECT20");
        setCouponInput("DIRECT20");
      }
      if (savedSource) {
        setSource(savedSource);
      }
    }
  }, []);

  const discount = appliedCoupon.toUpperCase() === "DIRECT20" ? Math.round(subtotal * 0.2) : 0;

  const deliveryFee =
    subtotal === 0 || subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
  const total = Math.max(0, subtotal - discount + deliveryFee);

  function handleApplyCoupon(e: React.FormEvent) {
    if (e) e.preventDefault();
    if (couponInput.toUpperCase() === "DIRECT20") {
      setAppliedCoupon("DIRECT20");
      setError(null);
    } else {
      setError("Invalid coupon code. Try DIRECT20.");
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon("");
    setCouponInput("");
    localStorage.removeItem("promo_coupon");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userPaymentStatus) {
      setError("Please confirm your payment status by clicking Done or Not Done below the QR code.");
      return;
    }
    setError(null);
    setPlacing(true);
    try {
      const result = await createOrder({
        customerName: form.name,
        phone: form.phone,
        email: form.email || undefined,
        address: form.address,
        notes: form.notes || undefined,
        paymentMethod: payment,
        items: lines.map((l) => ({
          productId: l.id,
          name: l.name,
          price: l.price,
          qty: l.qty,
        })),
        paymentStatus: userPaymentStatus,
        discountCode: appliedCoupon || undefined,
        source: (source as any) || undefined,
      });
      setOrder(result);
      setPollingStatus(result.paymentStatus);
      clearCart();
      localStorage.removeItem("promo_coupon");
      localStorage.removeItem("promo_source");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(
          "Couldn't reach the kitchen's server. Please check your connection and try again."
        );
      }
    } finally {
      setPlacing(false);
    }
  }

  useEffect(() => {
    if (!order) return;
    const interval = setInterval(async () => {
      try {
        const res = await getPublicOrder(order._id);
        if (res.paymentStatus !== pollingStatus) {
          setPollingStatus(res.paymentStatus);
        }
      } catch (e) {
        // ignore polling errors
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [order, pollingStatus]);

  if (!ready) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-14 md:px-8 md:py-20">
        <p className="font-display text-sm font-semibold text-forest/60">
          Loading…
        </p>
      </main>
    );
  }

  if (order) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-16 text-center md:px-8 md:py-24">
        <p className="text-5xl">🎉</p>
        <p className="mt-4 font-display text-sm font-bold uppercase tracking-widest text-tomato">
          Order confirmed
        </p>
        <h1 className="mt-2 font-script text-6xl text-forest md:text-7xl">
          Thank you!
        </h1>
        <p className="mt-4 text-forest/70">
          Your order{" "}
          <span className="font-bold text-forest">{order.orderNumber}</span>{" "}
          has been placed. We&apos;ll start cooking right away — expect it at
          your door in about 35–40 minutes.
          {order.email && (
            <>
              {" "}
              We&apos;ll email <span className="font-semibold">{order.email}</span> as
              your order status updates.
            </>
          )}
        </p>
        <div className="mx-auto mt-8 w-fit rounded-2xl border-2 border-forest/15 bg-card px-8 py-4">
          <p className="font-display text-xs font-bold uppercase tracking-widest text-forest/60">
            Payment Status
          </p>
          <div className="mt-2 text-xl font-bold font-display flex items-center justify-center gap-2">
            {pollingStatus === "Confirmed" ? (
              <span className="text-forest">✅ Confirmed by Sunny</span>
            ) : pollingStatus === "Pending" ? (
              <span className="text-[#c09665]">⏳ Pending</span>
            ) : pollingStatus === "User_Done" ? (
              <span className="text-[#c09665]">⏳ Verifying Payment...</span>
            ) : (
              <span className="text-tomato">❌ Not Done</span>
            )}
          </div>
        </div>
        <div className="mx-auto mt-4 w-fit rounded-2xl border-2 border-forest/15 bg-card px-8 py-4 min-w-[280px]">
          <p className="font-display text-xs font-bold uppercase tracking-widest text-forest/60">
            Payment Method
          </p>
          <p className="font-display text-base font-semibold text-forest">
            {order.paymentMethod === "cod"
              ? "Cash on delivery"
              : "UPI — pay on delivery link sent by SMS"}
          </p>
          
          {order.discountAmount && order.discountAmount > 0 ? (
            <>
              <p className="mt-3 font-display text-xs font-bold uppercase tracking-widest text-forest/60">
                Subtotal
              </p>
              <p className="font-display text-base font-semibold text-forest/80">
                ₹{order.subtotal}
              </p>
              <p className="mt-3 font-display text-xs font-bold uppercase tracking-widest text-tomato">
                Discount ({order.discountCode})
              </p>
              <p className="font-display text-base font-semibold text-tomato">
                -₹{order.discountAmount}
              </p>
            </>
          ) : null}

          <p className="mt-3 font-display text-xs font-bold uppercase tracking-widest text-forest/60">
            Total Paid/Due
          </p>
          <p className="font-display text-lg font-extrabold text-forest">
            ₹{order.total}
          </p>
        </div>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/menu"
            className="focus-ring rounded-full border-2 border-forest px-6 py-3 font-display text-sm font-bold text-forest transition hover:bg-forest hover:text-cream"
          >
            Order Something Else
          </Link>
          <Link
            href="/"
            className="focus-ring rounded-full bg-forest px-6 py-3 font-display text-sm font-bold text-cream transition hover:bg-tomato"
          >
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  if (lines.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-16 text-center md:px-8 md:py-24">
        <p className="text-5xl">🛍️</p>
        <h1 className="mt-4 font-script text-5xl text-forest md:text-6xl">
          Nothing to check out yet
        </h1>
        <p className="mt-3 text-forest/70">
          Add a few dishes to your cart first.
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
    <main className="mx-auto max-w-4xl px-5 py-14 md:px-8 md:py-20">
      <p className="font-display text-sm font-bold uppercase tracking-widest text-tomato">
        Almost there
      </p>
      <h1 className="mt-2 font-script text-6xl text-forest md:text-7xl">
        Checkout
      </h1>

      {error && (
        <div className="mt-6 rounded-2xl border-2 border-tomato/40 bg-tomato/10 px-5 py-4 font-display text-sm font-semibold text-tomato">
          {error}
        </div>
      )}

      <div className="mt-8 grid gap-8 md:grid-cols-[1.3fr_1fr]">
        <form
          id="checkout-form"
          onSubmit={handleSubmit}
          className="space-y-5 rounded-3xl border-2 border-forest/15 bg-card p-6 md:p-8"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="font-display text-xs font-bold uppercase tracking-widest text-forest/70">
                Name
              </span>
              <input
                required
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="focus-ring mt-2 w-full rounded-xl border-2 border-forest/15 bg-cream px-4 py-3 text-forest outline-none placeholder:text-forest/30"
                placeholder="Your name"
              />
            </label>
            <label className="block">
              <span className="font-display text-xs font-bold uppercase tracking-widest text-forest/70">
                Phone
              </span>
              <input
                required
                type="tel"
                pattern="[0-9]{10}"
                maxLength={10}
                title="Please enter exactly 10 digits"
                value={form.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setForm({ ...form, phone: val });
                }}
                className="focus-ring mt-2 w-full rounded-xl border-2 border-forest/15 bg-cream px-4 py-3 text-forest outline-none placeholder:text-forest/30"
                placeholder="10-digit phone number"
              />
            </label>
          </div>

          <label className="block">
            <span className="font-display text-xs font-bold uppercase tracking-widest text-forest/70">
              Email (optional — for order updates)
            </span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="focus-ring mt-2 w-full rounded-xl border-2 border-forest/15 bg-cream px-4 py-3 text-forest outline-none placeholder:text-forest/30"
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <span className="font-display text-xs font-bold uppercase tracking-widest text-forest/70">
              Delivery address
            </span>
            <textarea
              required
              rows={3}
              minLength={5}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="focus-ring mt-2 w-full resize-none rounded-xl border-2 border-forest/15 bg-cream px-4 py-3 text-forest outline-none placeholder:text-forest/30"
              placeholder="House / street / landmark"
            />
          </label>

          <label className="block">
            <span className="font-display text-xs font-bold uppercase tracking-widest text-forest/70">
              Delivery notes (optional)
            </span>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="focus-ring mt-2 w-full rounded-xl border-2 border-forest/15 bg-cream px-4 py-3 text-forest outline-none placeholder:text-forest/30"
              placeholder="e.g. ring the bell twice"
            />
          </label>

          <div>
            <span className="font-display text-xs font-bold uppercase tracking-widest text-forest/70">
              Payment method
            </span>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPayment("cod")}
                className={`focus-ring rounded-xl border-2 px-4 py-3 text-left font-display text-sm font-bold transition ${
                  payment === "cod"
                    ? "border-forest bg-forest text-cream"
                    : "border-forest/15 text-forest/70 hover:border-forest/40"
                }`}
              >
                💵 Cash on delivery
              </button>
              <button
                type="button"
                onClick={() => setPayment("upi")}
                className={`focus-ring rounded-xl border-2 px-4 py-3 text-left font-display text-sm font-bold transition ${
                  payment === "upi"
                    ? "border-forest bg-forest text-cream"
                    : "border-forest/15 text-forest/70 hover:border-forest/40"
                }`}
              >
                📱 UPI
              </button>
            </div>
            
            {/* QR Code and Actions */}
            <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-forest/20 bg-cream/50 p-6">
              <p className="font-display text-sm font-bold uppercase tracking-widest text-forest mb-4 text-center">
                Scan to Pay
              </p>
              <div className="w-48 h-48 relative rounded-xl overflow-hidden shadow-md border-4 border-white mb-6 bg-white flex items-center justify-center">
                <Image
                  src="/qr_code.png"
                  alt="Payment QR Code"
                  width={180}
                  height={180}
                  className="object-contain"
                />
              </div>
              <p className="text-sm text-forest/80 mb-4 text-center">
                Please scan the QR code above to complete your payment, then confirm below.
              </p>
              <div className="flex gap-4 w-full">
                <button
                  type="button"
                  onClick={() => setUserPaymentStatus("User_Done")}
                  className={`flex-1 focus-ring rounded-xl border-2 px-4 py-3 text-center font-display text-sm font-bold transition ${
                    userPaymentStatus === "User_Done"
                      ? "border-forest bg-forest text-cream"
                      : "border-forest/20 text-forest hover:border-forest/40 bg-white"
                  }`}
                >
                  ✅ Done
                </button>
                <button
                  type="button"
                  onClick={() => setUserPaymentStatus("User_Not_Done")}
                  className={`flex-1 focus-ring rounded-xl border-2 px-4 py-3 text-center font-display text-sm font-bold transition ${
                    userPaymentStatus === "User_Not_Done"
                      ? "border-tomato bg-tomato text-cream"
                      : "border-tomato/20 text-tomato hover:border-tomato/40 bg-white"
                  }`}
                >
                  ❌ Not Done
                </button>
              </div>
            </div>
          </div>
        </form>

        <aside className="h-fit rounded-3xl border-2 border-forest/15 bg-card p-6">
          <p className="font-display text-sm font-bold uppercase tracking-widest text-forest/70">
            Order summary
          </p>
          <div className="mt-4 space-y-3">
            {lines.map((line) => (
              <div
                key={line.id}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="text-forest/80">
                  {line.qty} × {line.name}
                </span>
                <span className="shrink-0 font-display font-semibold text-forest">
                  ₹{line.qty * line.price}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2 border-t border-dashed border-forest/25 pt-4 font-display text-sm text-forest/80">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-tomato font-semibold">
                <span>Discount ({appliedCoupon})</span>
                <span>-₹{discount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery fee</span>
              <span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span>
            </div>
          </div>
          <div className="mt-3 flex justify-between border-t border-dashed border-forest/25 pt-3 font-display text-lg font-extrabold text-forest">
            <span>Total</span>
            <span>₹{total}</span>
          </div>

          {/* Coupon Code Section */}
          <div className="mt-6 border-t border-dashed border-forest/25 pt-4">
            <p className="font-display text-xs font-bold uppercase tracking-widest text-forest/70 mb-2">
              Promo Coupon
            </p>
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-tomato/10 border border-tomato/20 rounded-xl px-3 py-2 text-xs text-tomato">
                <span className="font-display font-bold">🎉 {appliedCoupon} active (20% off)</span>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="font-display font-bold hover:underline text-[10px] uppercase text-tomato"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code (e.g. DIRECT20)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 focus-ring rounded-lg border-2 border-forest/15 bg-cream px-3 py-1.5 text-xs text-forest outline-none uppercase placeholder:text-forest/30"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="focus-ring rounded-lg bg-forest px-3 py-1.5 font-display text-xs font-bold text-cream transition hover:bg-forestDark active:scale-95"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            form="checkout-form"
            disabled={placing}
            className="focus-ring mt-6 w-full rounded-full bg-tomato px-6 py-3 font-display text-sm font-bold text-cream transition hover:bg-forest disabled:opacity-60"
          >
            {placing ? "Placing order…" : `Place Order · ₹${total}`}
          </button>
        </aside>
      </div>
    </main>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Script from "next/script";
import { useCart } from "@/lib/cart-context";
import { DELIVERY_FEE, FREE_DELIVERY_ABOVE } from "@/lib/menu";
import {
  createOrder,
  createRazorpayOrder,
  verifyPayment,
  getPublicOrder,
  ApiError,
  type Order,
  type PaymentStatus,
  logFailedPayment,
  checkPincodeServiceability,
} from "@/lib/api";

type PaymentMethod = "cod" | "upi";

// Common country codes with their expected national-number digit length,
// used both for the dropdown and for validating the phone number.
const COUNTRIES = [
  { code: "+91", name: "India", digits: 10 },
  { code: "+1", name: "USA / Canada", digits: 10 },
  { code: "+44", name: "United Kingdom", digits: 10 },
  { code: "+971", name: "UAE", digits: 9 },
  { code: "+61", name: "Australia", digits: 9 },
  { code: "+65", name: "Singapore", digits: 8 },
  { code: "+966", name: "Saudi Arabia", digits: 9 },
  { code: "+974", name: "Qatar", digits: 8 },
];

function isValidPhoneForCountry(countryCode: string, phone: string): boolean {
  const country = COUNTRIES.find((c) => c.code === countryCode);
  if (!country) return phone.length >= 6 && phone.length <= 15;

  if (countryCode === "+91") {
    // Indian mobile numbers: exactly 10 digits, starting 6-9.
    return /^[6-9]\d{9}$/.test(phone);
  }

  return phone.length === country.digits;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

// Actively waits for the Razorpay script to be ready, instead of trusting
// a one-time onLoad callback (which can miss firing on client-side
// back/forward navigation since the browser may have already cached the
// script tag). Checks immediately, then polls briefly.
function waitForRazorpay(timeoutMs = 6000): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const start = Date.now();
    const interval = setInterval(() => {
      if (typeof window !== "undefined" && window.Razorpay) {
        clearInterval(interval);
        resolve(true);
      } else if (Date.now() - start > timeoutMs) {
        clearInterval(interval);
        resolve(false);
      }
    }, 150);
  });
}

export default function CheckoutPage() {
  const { lines, subtotal, clearCart, ready } = useCart();
  const [payment, setPayment] = useState<PaymentMethod>("upi");
  const [razorpayReady, setRazorpayReady] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [pollingStatus, setPollingStatus] = useState<PaymentStatus>("Pending");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(timer);
  }, [error]);

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [source, setSource] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    countryCode: "+91",
    phone: "",
    email: "",
    address: "",
    pincode: "",
    notes: "",
  });

  // "checking" | "yes" | "no" | null (not enough digits entered yet)
  const [serviceability, setServiceability] = useState<
    "checking" | "yes" | "no" | null
  >(null);

  useEffect(() => {
    if (form.pincode.length !== 6) {
      setServiceability(null);
      return;
    }
    let cancelled = false;
    setServiceability("checking");
    const timer = setTimeout(() => {
      checkPincodeServiceability(form.pincode)
        .then((res) => {
          if (!cancelled) setServiceability(res.serviceable ? "yes" : "no");
        })
        .catch(() => {
          // If the check itself fails, don't block checkout over it —
          // treat as unknown/serviceable and let order creation proceed.
          if (!cancelled) setServiceability("yes");
        });
    }, 400); // small debounce so it doesn't fire on every keystroke
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [form.pincode]);

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

  function finishSuccessfulOrder(result: Order) {
    setOrder(result);
    setPollingStatus(result.paymentStatus);
    clearCart();
    localStorage.removeItem("promo_coupon");
    localStorage.removeItem("promo_source");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (form.name.trim().length < 2) {
      setError("Please enter your name.");
      return;
    }

    if (form.address.trim().length < 5) {
      setError("Please enter your delivery address.");
      return;
    }

    if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setError("Please enter a valid email address, or leave it blank.");
      return;
    }

    if (!isValidPhoneForCountry(form.countryCode, form.phone)) {
      const country = COUNTRIES.find((c) => c.code === form.countryCode);
      setError(
        `Please enter a valid phone number for ${country?.name || "the selected country"} (${country?.digits || 6}-15 digits expected).`
      );
      return;
    }

    if (!/^\d{6}$/.test(form.pincode)) {
      setError("Please enter a valid 6-digit pincode.");
      return;
    }

    if (serviceability === "no") {
      setError("Sorry, we don't currently deliver to this pincode.");
      return;
    }

    setError(null);
    setPlacing(true);
    try {
      // Step 1: create the order in our DB (paymentStatus stays Pending
      // until Razorpay confirms it, for upi).
      const fullAddress = `${form.address.trim()} - ${form.pincode}`;
      const result = await createOrder({
        customerName: form.name,
        phone: `${form.countryCode}${form.phone}`,
        email: form.email || undefined,
        address: fullAddress,
        notes: form.notes || undefined,
        paymentMethod: payment,
        items: lines.map((l) => ({
          productId: l.id,
          name: l.name,
          price: l.price,
          qty: l.qty,
        })),
        paymentStatus: "Pending",
        discountCode: appliedCoupon || undefined,
        source: (source as any) || undefined,
      });


      // Step 2: make sure Razorpay's script has actually finished loading.
      const razorpayLoaded = await waitForRazorpay();
      if (!razorpayLoaded) {
        setError(
          `Payment gateway couldn't load. Please refresh the page and try again — your order ${result.orderNumber} is saved.`
        );
        setPlacing(false);
        return;
      }

      // Step 3: ask our backend for a Razorpay order priced off this DB order's total.
      const rzpOrder = await createRazorpayOrder(result._id);

      // Step 3: open Razorpay's checkout popup.
      const rzp = new window.Razorpay({
        key: rzpOrder.keyId,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        order_id: rzpOrder.razorpayOrderId,
        name: "Sunny's Kitchen",
        description: `Order ${result.orderNumber}`,
        prefill: {
          name: form.name,
          email: form.email,
          contact: `${form.countryCode}${form.phone}`,
          ...(form.countryCode === "+91" ? { method: "upi" } : {}),
        },
        theme: { color: "#c2410c" },
        config: {
          display: {
            hide: [{ method: "emi" }],
          },
        },
        handler: async function (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) {
          try {
            // Step 4: server verifies the signature — this is what actually confirms payment.
            const verified = await verifyPayment(result._id, response);
            finishSuccessfulOrder(verified);
          } catch (err) {
            setError(
              `Payment succeeded but we couldn't confirm it automatically. Please contact us with your order number ${result.orderNumber}.`
            );
          } finally {
            setPlacing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setPlacing(false);
            setError("Payment was cancelled. Please try again when you're ready.");
            logFailedPayment(result._id, {
              error_reason: "cancelled_by_user",
            }).catch(() => { });
          },
        },
      });

      rzp.on("payment.failed", function () {
        setPlacing(false);
        setError(
          `Payment failed. Your order ${result.orderNumber} is saved — you can retry payment or contact us.`
        );
      });

      rzp.open();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(
          "Couldn't reach the kitchen's server. Please check your connection and try again."
        );
      }
      setPlacing(false);
    }
  }

  const [deliveryInfo, setDeliveryInfo] = useState<{
    trackingUrl?: string;
    riderName?: string;
    riderPhone?: string;
  }>({});

  useEffect(() => {
    if (!order) return;
    const interval = setInterval(async () => {
      try {
        const res = await getPublicOrder(order._id);
        if (res.paymentStatus !== pollingStatus) {
          setPollingStatus(res.paymentStatus);
        }
        if (res.deliveryTrackingUrl && res.deliveryTrackingUrl !== deliveryInfo.trackingUrl) {
          setDeliveryInfo({
            trackingUrl: res.deliveryTrackingUrl,
            riderName: res.riderName,
            riderPhone: res.riderPhone,
          });
        }
      } catch (e) {
        // ignore polling errors
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [order, pollingStatus, deliveryInfo.trackingUrl]);

  const razorpayScript = (
    <Script
      src="https://checkout.razorpay.com/v1/checkout.js"
      onLoad={() => setRazorpayReady(true)}
    />
  );

  if (!ready) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-14 md:px-8 md:py-20">
        {razorpayScript}
        <p className="font-display text-sm font-semibold text-forest/60">
          Loading…
        </p>
      </main>
    );
  }

  if (order) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-16 text-center md:px-8 md:py-24">
        {razorpayScript}
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
        {deliveryInfo.trackingUrl && (
          <div className="mx-auto mt-4 w-fit rounded-2xl border-2 border-tomato/30 bg-tomato/5 px-8 py-4">
            <p className="font-display text-xs font-bold uppercase tracking-widest text-forest/60">
              Delivery
            </p>
            {deliveryInfo.riderName && (
              <p className="mt-1 text-sm text-forest/70">
                {deliveryInfo.riderName}
                {deliveryInfo.riderPhone && <> · {deliveryInfo.riderPhone}</>}
              </p>
            )}
            <a
              href={deliveryInfo.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block rounded-full bg-tomato px-6 py-2 font-display text-sm font-bold text-cream transition hover:bg-forest"
            >
              📍 Track your delivery
            </a>
          </div>
        )}
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
      {razorpayScript}
      <p className="font-display text-sm font-bold uppercase tracking-widest text-tomato">
        Almost there
      </p>
      <h1 className="mt-2 font-script text-6xl text-forest md:text-7xl">
        Checkout
      </h1>

      {error && (
        <div className="fixed right-4 top-4 z-50 max-w-sm animate-in fade-in slide-in-from-top-4 duration-300 sm:right-6 sm:top-6">
          <div className="flex items-start gap-3 rounded-2xl border-2 border-tomato/40 bg-cream px-5 py-4 shadow-2xl">
            <span className="text-lg leading-none">⚠️</span>
            <p className="flex-1 font-display text-sm font-semibold text-tomato">{error}</p>
            <button
              onClick={() => setError(null)}
              aria-label="Dismiss"
              className="text-tomato/60 transition hover:text-tomato"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-8 md:grid-cols-[1.3fr_1fr]">
        <form
          id="checkout-form"
          onSubmit={handleSubmit}
          noValidate
          className="space-y-5 rounded-3xl border-2 border-forest/15 bg-card p-6 md:p-8"
        >
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
            <div className="mt-2 flex gap-2">
              <select
                value={form.countryCode}
                onChange={(e) => {
                  setForm({ ...form, countryCode: e.target.value, phone: "" });
                }}
                className="focus-ring w-32 shrink-0 rounded-xl border-2 border-forest/15 bg-cream px-2 py-3 text-forest outline-none"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} {c.name}
                  </option>
                ))}
              </select>
              <input
                required
                type="tel"
                maxLength={
                  COUNTRIES.find((c) => c.code === form.countryCode)?.digits ?? 15
                }
                title="Please enter a valid phone number for the selected country"
                value={form.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setForm({ ...form, phone: val });
                }}
                className="focus-ring w-full rounded-xl border-2 border-forest/15 bg-cream px-4 py-3 text-forest outline-none placeholder:text-forest/30"
                placeholder="Phone number"
              />
            </div>
          </label>

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
              Pincode
            </span>
            <input
              type="text"
              inputMode="numeric"
              required
              pattern="\d{6}"
              maxLength={6}
              title="Please enter a valid 6-digit pincode"
              value={form.pincode}
              onChange={(e) =>
                setForm({ ...form, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })
              }
              className="focus-ring mt-2 w-full rounded-xl border-2 border-forest/15 bg-cream px-4 py-3 text-forest outline-none placeholder:text-forest/30"
              placeholder="452010"
            />
            {serviceability === "checking" && (
              <p className="mt-1.5 text-xs text-forest/50">Checking delivery availability...</p>
            )}
            {serviceability === "yes" && (
              <p className="mt-1.5 text-xs font-semibold text-forest">✅ We deliver here</p>
            )}
            {serviceability === "no" && (
              <p className="mt-1.5 text-xs font-semibold text-tomato">
                😔 Sorry, we don't deliver to this pincode yet
              </p>
            )}
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
            <div className="mt-2 rounded-xl border-2 border-forest bg-forest px-4 py-3 text-left font-display text-sm font-bold text-cream">
              📱 Pay Online
            </div>

            {true && (
              <div className="mt-6 rounded-2xl border-2 border-dashed border-forest/20 bg-cream/50 p-6 text-center">
                <p className="text-sm text-forest/80">
                  Clicking <span className="font-bold">Place Order</span> below will open a
                  secure Razorpay window where you can pay via UPI, card, or netbanking.
                </p>
              </div>
            )}
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
            disabled={placing || serviceability === "no"}
            className="focus-ring mt-6 w-full rounded-full bg-tomato px-6 py-3 font-display text-sm font-bold text-cream transition hover:bg-forest disabled:opacity-60"
          >
            {placing ? "Placing order…" : `Place Order · ₹${total}`}
          </button>
        </aside>
      </div>
    </main>
  );
}
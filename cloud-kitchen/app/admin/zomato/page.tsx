"use client";

import { useEffect, useState, useCallback } from "react";
import { getAdminToken } from "@/lib/admin-auth";
import {
  adminGetOrders,
  adminUpdateOrderStatus,
  adminUpdateOrderPaymentStatus,
  simulateOrder,
  getProducts,
  ApiError,
  type Order,
  type OrderStatus,
  type PaymentStatus,
  type Product,
} from "@/lib/api";
import { ExternalLink, RefreshCw, ShoppingBag, DollarSign, Clock } from "lucide-react";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_OPTIONS = Object.keys(STATUS_LABELS) as OrderStatus[];

export default function ZomatoMerchantHubPage() {
  const [token, setToken] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);

  const loadZomatoOrders = useCallback(async (authToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminGetOrders(authToken, undefined, "zomato");
      setOrders(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load Zomato orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = getAdminToken();
    if (t) {
      setToken(t);
      loadZomatoOrders(t);
      getProducts().then(setProducts).catch(() => {});
    }
  }, [loadZomatoOrders]);

  async function changeOrderStatus(order: Order, status: OrderStatus) {
    if (!token) return;
    try {
      const updated = await adminUpdateOrderStatus(token, order._id, status);
      setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Status update failed");
    }
  }

  async function changeOrderPaymentStatus(order: Order, paymentStatus: PaymentStatus) {
    if (!token) return;
    try {
      const updated = await adminUpdateOrderPaymentStatus(token, order._id, paymentStatus);
      setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Payment status update failed");
    }
  }

  async function handleQuickSimulate() {
    if (products.length === 0) {
      alert("No products available to simulate.");
      return;
    }
    setSimulating(true);
    try {
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      const randomName = ["Karan Johar", "Ananya Pandey", "Rajesh Khanna", "Deepika Padukone"][Math.floor(Math.random() * 4)];
      const randomPhone = `9${Math.floor(100000000 + Math.random() * 900000000)}`;

      await simulateOrder({
        source: "zomato",
        customerName: `${randomName} (Zomato)`,
        phone: randomPhone,
        address: "Indiranagar, 100 Feet Road, Bangalore",
        items: [{ productId: randomProduct._id, qty: Math.floor(1 + Math.random() * 2) }],
      });

      if (token) loadZomatoOrders(token);
    } catch (err: any) {
      alert(err?.message || "Simulation failed");
    } finally {
      setSimulating(false);
    }
  }

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const totalRevenue = orders.reduce((sum, o) => (o.status !== "cancelled" ? sum + o.total : sum), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#e23744]/20 pb-4">
        <div className="flex items-center gap-3">
          <img src="/zomato.png" alt="Zomato" className="h-10 w-10 object-contain" />
          <div>
            <h2 className="font-script text-4xl text-forest">Zomato Merchant Hub</h2>
            <p className="font-display text-sm font-semibold text-forest/60">
              Manage Zomato orders, status updates, and platform performance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <a
            href="https://merchant.zomato.com"
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring rounded-full bg-[#e23744] px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-white shadow transition hover:bg-[#c02834] flex items-center gap-2 hover:scale-105 active:scale-95"
          >
            <span>Launch Zomato Merchant Portal</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          <button
            onClick={handleQuickSimulate}
            disabled={simulating}
            className="focus-ring rounded-full bg-forest px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-cream shadow transition hover:bg-forestDark flex items-center gap-2 hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${simulating ? "animate-spin" : ""}`} />
            <span>{simulating ? "Simulating..." : "Simulate Zomato Order"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border-2 border-tomato/40 bg-tomato/10 px-4 py-3 font-display text-sm font-semibold text-tomato">
          {error}
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border-2 border-[#e23744]/20 bg-card p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e23744]/10 text-2xl text-[#e23744]">
              <ShoppingBag className="h-6 w-6" />
            </span>
            <div>
              <p className="font-display text-3xl font-extrabold text-forest">{orders.length}</p>
              <p className="font-display text-xs font-bold uppercase tracking-widest text-forest/60">
                Total Zomato Orders
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border-2 border-sun/30 bg-card p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-sun/20 text-2xl text-sunDeep">
              <Clock className="h-6 w-6" />
            </span>
            <div>
              <p className="font-display text-3xl font-extrabold text-forest">{pendingCount}</p>
              <p className="font-display text-xs font-bold uppercase tracking-widest text-forest/60">
                Pending Action
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border-2 border-forest/15 bg-card p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest/10 text-2xl text-forest">
              <DollarSign className="h-6 w-6" />
            </span>
            <div>
              <p className="font-display text-3xl font-extrabold text-forest">₹{totalRevenue.toLocaleString()}</p>
              <p className="font-display text-xs font-bold uppercase tracking-widest text-forest/60">
                Zomato Revenue
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Listing */}
      {loading ? (
        <p className="font-display text-sm text-forest/60">Loading Zomato orders...</p>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-[#e23744]/30 bg-card p-12 text-center">
          <img src="/zomato.png" alt="Zomato" className="mx-auto h-12 w-12 object-contain opacity-50 mb-3" />
          <h3 className="font-display text-lg font-bold text-forest">No Zomato Orders Yet</h3>
          <p className="text-xs text-forest/60 mt-1 max-w-sm mx-auto">
            Use the &ldquo;Simulate Zomato Order&rdquo; button above to generate sample orders and test your kitchen dispatch workflow.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="rounded-2xl border-2 border-l-[6px] border-l-[#e23744] border-forest/15 bg-card p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-display text-lg font-bold text-forest">{order.orderNumber}</p>
                    <span className="rounded-full bg-[#e23744]/15 px-3 py-0.5 font-display text-xs font-bold uppercase tracking-wide text-[#e23744]">
                      {STATUS_LABELS[order.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-forest/50">{new Date(order.createdAt).toLocaleString()}</p>
                  <p className="mt-2 text-sm text-forest/70">
                    <span className="font-semibold text-forest">{order.customerName}</span> · {order.phone}
                  </p>
                  <p className="text-sm text-forest/70 max-w-xl">{order.address}</p>
                </div>

                <select
                  value={order.status}
                  onChange={(e) => changeOrderStatus(order, e.target.value as OrderStatus)}
                  className="focus-ring rounded-xl border-2 border-[#e23744] bg-[#e23744] px-4 py-2 font-display text-xs font-bold uppercase tracking-wide text-white hover:bg-[#c02834] cursor-pointer"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s} className="bg-card text-forest">
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 divide-y divide-forest/10 border-t border-forest/10 pt-4 bg-cream/30 -mx-5 px-5 pb-2">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between py-2 text-sm text-forest/80">
                    <span className="flex items-center gap-2">
                      <span className="font-semibold">{item.qty} ×</span> {item.name}
                    </span>
                    <span className="font-display font-semibold text-forest">₹{item.qty * item.price}</span>
                  </div>
                ))}
              </div>

              <div className="mt-0 flex items-center justify-between bg-cream/50 -mx-5 px-5 py-3 rounded-b-xl border-t border-forest/10 text-sm">
                <span className="text-forest/60 flex items-center gap-2">
                  <span className="font-semibold uppercase text-xs tracking-wider bg-[#e23744]/15 text-[#e23744] px-2 py-1 rounded">
                    Zomato Channel
                  </span>
                  Delivery: ₹{order.deliveryFee}
                </span>
                <span className="font-display text-lg font-extrabold text-forest">Total: ₹{order.total}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

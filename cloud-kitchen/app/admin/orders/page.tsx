"use client";

import { useEffect, useState, useCallback, Suspense, ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { getAdminToken } from "@/lib/admin-auth";
import {
  adminGetOrders,
  adminUpdateOrderStatus,
  adminUpdateOrderPaymentStatus,
  ApiError,
  getProducts,
  simulateOrder,
  type Order,
  type OrderStatus,
  type OrderSource,
  type PaymentStatus,
  type Product,
} from "@/lib/api";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_OPTIONS = Object.keys(STATUS_LABELS) as OrderStatus[];

const STATUS_STYLES: Record<OrderStatus, { border: string; badge: string }> = {
  pending: { border: "border-l-sun", badge: "bg-sun/20 text-sunDeep" },
  confirmed: { border: "border-l-forest", badge: "bg-forest/10 text-forest" },
  preparing: { border: "border-l-forest", badge: "bg-forest/10 text-forest" },
  out_for_delivery: { border: "border-l-tomato", badge: "bg-tomato/15 text-tomato" },
  delivered: { border: "border-l-forest/40", badge: "bg-forest/5 text-forest/60" },
  cancelled: { border: "border-l-forest/20", badge: "bg-forest/5 text-forest/40 line-through" },
};

const SOURCE_ICONS: Record<OrderSource, ReactNode> = {
  website: <span className="text-xl" title="Website">🌐</span>,
  swiggy: <img src="/swiggy.png" alt="Swiggy" className="w-6 h-6 object-contain inline-block" title="Swiggy" />,
  zomato: <img src="/zomato.png" alt="Zomato" className="w-6 h-6 object-contain inline-block" title="Zomato" />,
};

function OrdersContent() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">((searchParams.get("status") as OrderStatus) || "");
  const [sourceFilter, setSourceFilter] = useState<OrderSource | "">((searchParams.get("source") as OrderSource) || "");
  const [searchQuery, setSearchQuery] = useState("");

  const [showSimulator, setShowSimulator] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [simSource, setSimSource] = useState<"swiggy" | "zomato">("swiggy");
  const [simName, setSimName] = useState("");
  const [simPhone, setSimPhone] = useState("");
  const [simAddress, setSimAddress] = useState("");
  const [simProductId, setSimProductId] = useState("");
  const [simQty, setSimQty] = useState(1);
  const [simulating, setSimulating] = useState(false);

  const INDIAN_NAMES = ["Aarav Mehta", "Neha Sharma", "Rohan Gupta", "Priya Nair", "Vikram Singh", "Anjali Bose", "Kabir Sen", "Pooja Roy"];
  const LOCATIONS = ["Koramangala, Ground Floor, Flat 3B", "Indiranagar, 12th Main Road, Flat A", "HSR Layout, Sector 3, House 45", "Whitefield, Prestige Apartments, Villa 12"];

  const randomizeSimulatorDetails = useCallback(() => {
    const randomName = INDIAN_NAMES[Math.floor(Math.random() * INDIAN_NAMES.length)];
    const randomPhone = `9${Math.floor(100000000 + Math.random() * 900000000)}`;
    const randomAddress = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    setSimName(randomName);
    setSimPhone(randomPhone);
    setSimAddress(randomAddress);
  }, []);

  useEffect(() => {
    getProducts()
      .then((data) => {
        setProducts(data);
        if (data.length > 0) setSimProductId(data[0]._id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (showSimulator) {
      randomizeSimulatorDetails();
    }
  }, [showSimulator, randomizeSimulatorDetails]);

  async function handleFireWebhook() {
    if (!simProductId) return;
    setSimulating(true);
    try {
      await simulateOrder({
        source: simSource,
        customerName: simName,
        phone: simPhone,
        address: simAddress,
        items: [{ productId: simProductId, qty: simQty }],
      });
      setShowSimulator(false);
      const t = getAdminToken();
      if (t) loadOrders(t);
    } catch (err: any) {
      alert(err?.message || "Webhook simulation failed.");
    } finally {
      setSimulating(false);
    }
  }

  useEffect(() => {
    setStatusFilter((searchParams.get("status") as OrderStatus) || "");
    setSourceFilter((searchParams.get("source") as OrderSource) || "");
  }, [searchParams]);

  const loadOrders = useCallback(async (authToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminGetOrders(
        authToken,
        statusFilter || undefined,
        sourceFilter || undefined,
        searchQuery || undefined
      );
      setOrders(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, sourceFilter, searchQuery]);

  useEffect(() => {
    const t = getAdminToken();
    if (t) {
      setToken(t);
      loadOrders(t);
    }
  }, [loadOrders]);

  async function changeOrderStatus(order: Order, status: OrderStatus) {
    if (!token) return;
    try {
      const updated = await adminUpdateOrderStatus(token, order._id, status);
      setOrders((prev) =>
        prev.map((o) => (o._id === updated._id ? updated : o))
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Status update failed");
    }
  }

  async function changeOrderPaymentStatus(order: Order, paymentStatus: PaymentStatus) {
    if (!token) return;
    try {
      const updated = await adminUpdateOrderPaymentStatus(token, order._id, paymentStatus);
      setOrders((prev) =>
        prev.map((o) => (o._id === updated._id ? updated : o))
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Payment status update failed");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="font-script text-4xl text-forest">Orders Management</h2>
          <p className="mt-1 font-display text-sm font-semibold text-forest/60">
            View and manage all incoming orders.
          </p>
        </div>
        <button
          onClick={() => setShowSimulator(true)}
          className="focus-ring rounded-full bg-forest border border-forest/10 hover:bg-tomato transition px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-cream flex items-center gap-2 shadow hover:scale-105 active:scale-95"
        >
          🧪 Webhook Simulator
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 bg-card p-4 rounded-xl border-2 border-forest/10 shadow-sm">
        <input
          type="text"
          placeholder="Search by order ID, name, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 min-w-[200px] focus-ring rounded-lg border-2 border-forest/15 bg-cream px-3 py-2 text-sm text-forest outline-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "")}
          className="focus-ring rounded-lg border-2 border-forest/15 bg-cream px-3 py-2 text-sm text-forest outline-none"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value as OrderSource | "")}
          className="focus-ring rounded-lg border-2 border-forest/15 bg-cream px-3 py-2 text-sm text-forest outline-none"
        >
          <option value="">All Platforms</option>
          <option value="website">Website 🌐</option>
          <option value="swiggy">Swiggy</option>
          <option value="zomato">Zomato</option>
        </select>
      </div>

      {error && (
        <div className="rounded-xl border-2 border-tomato/40 bg-tomato/10 px-4 py-3 font-display text-sm font-semibold text-tomato">
          {error}
        </div>
      )}

      {loading ? (
        <p className="font-display text-sm text-forest/60">Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border-2 border-forest/10 bg-card p-8 text-center">
          <p className="font-display text-forest/60">No orders found.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => {
            const style = STATUS_STYLES[order.status];
            return (
              <div
                key={order._id}
                className={`rounded-2xl border-2 border-l-[6px] border-forest/15 bg-card p-5 shadow-sm transition hover:shadow-md ${style.border}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-lg font-bold text-forest">
                        {order.orderNumber}
                      </p>
                      <span className="text-xl" title={`Source: ${order.source}`}>
                        {SOURCE_ICONS[order.source || 'website']}
                      </span>
                      <span
                        className={`rounded-full px-3 py-0.5 font-display text-xs font-bold uppercase tracking-wide ${style.badge}`}
                      >
                        {STATUS_LABELS[order.status]}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-forest/50">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                    <p className="mt-2 text-sm text-forest/70">
                      <span className="font-semibold text-forest">{order.customerName}</span> · {order.phone}
                      {order.email && <> · {order.email}</>}
                    </p>
                    <p className="text-sm text-forest/70 max-w-xl">{order.address}</p>
                    {order.notes && (
                      <p className="text-sm italic text-forest/50 mt-1">
                        &ldquo;{order.notes}&rdquo;
                      </p>
                    )}
                  </div>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      changeOrderStatus(order, e.target.value as OrderStatus)
                    }
                    className="focus-ring rounded-xl border-2 border-forest bg-forest px-4 py-2 font-display text-xs font-bold uppercase tracking-wide text-cream hover:bg-forestDark cursor-pointer"
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
                    <div
                      key={i}
                      className="flex justify-between py-2 text-sm text-forest/80"
                    >
                      <span className="flex items-center gap-2">
                        <span className="font-semibold">{item.qty} ×</span> {item.name}
                      </span>
                      <span className="font-display font-semibold text-forest">
                        ₹{item.qty * item.price}
                      </span>
                    </div>
                  ))}
                  {order.discountAmount && order.discountAmount > 0 ? (
                    <div className="flex justify-between py-2 text-xs text-tomato font-semibold border-t border-dashed border-forest/10 mt-1">
                      <span>Discount ({order.discountCode})</span>
                      <span>-₹{order.discountAmount}</span>
                    </div>
                  ) : null}
                </div>

                <div className="mt-0 flex items-center justify-between bg-cream/50 -mx-5 px-5 py-3 rounded-b-xl border-t border-forest/10 text-sm">
                  <span className="text-forest/60 flex items-center gap-2">
                    <span className="font-semibold uppercase text-xs tracking-wider bg-forest/10 px-2 py-1 rounded">
                      {order.paymentMethod === "cod" ? "COD" : "UPI"}
                    </span>
                    <select
                      value={order.paymentStatus || "Pending"}
                      onChange={(e) =>
                        changeOrderPaymentStatus(order, e.target.value as PaymentStatus)
                      }
                      className="focus-ring rounded border border-forest/20 bg-white px-2 py-1 text-xs font-semibold text-forest cursor-pointer"
                    >
                      {order.paymentStatus === "User_Done" && <option value="User_Done" disabled>User Done</option>}
                      {order.paymentStatus === "User_Not_Done" && <option value="User_Not_Done" disabled>User Not Done</option>}
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                    </select>
                    Delivery: ₹{order.deliveryFee}
                  </span>
                  <span className="font-display text-lg font-extrabold text-forest">
                    Total: ₹{order.total}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Simulator Modal */}
      {showSimulator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg border-2 border-forest/15 bg-card rounded-3xl p-6 md:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowSimulator(false)}
              className="absolute top-4 right-4 text-forest/50 hover:text-forest transition font-bold text-lg p-1"
            >
              ✕
            </button>

            <h3 className="font-display text-2xl font-bold text-forest mb-2">
              🧪 Webhook Simulator
            </h3>

            <p className="text-xs text-forest/70 mb-6 font-body">
              Simulate a webhook request sent by Swiggy or Zomato to test incoming order synchronization.
            </p>

            <div className="space-y-4">
              {/* Platform Selection */}
              <div>
                <span className="font-display text-xs font-bold uppercase tracking-widest text-forest/70 block mb-2">
                  Order Source
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSimSource("swiggy")}
                    className={`rounded-xl border-2 px-4 py-3 text-center font-display text-sm font-bold transition flex items-center justify-center gap-2 ${
                      simSource === "swiggy"
                        ? "border-[#fc8019] bg-[#fc8019]/10 text-[#fc8019]"
                        : "border-forest/15 text-forest/70 hover:border-forest/40"
                    }`}
                  >
                    <img src="/swiggy.png" alt="Swiggy" className="w-5 h-5 object-contain" /> Swiggy
                  </button>
                  <button
                    onClick={() => setSimSource("zomato")}
                    className={`rounded-xl border-2 px-4 py-3 text-center font-display text-sm font-bold transition flex items-center justify-center gap-2 ${
                      simSource === "zomato"
                        ? "border-[#e23744] bg-[#e23744]/10 text-[#e23744]"
                        : "border-forest/15 text-forest/70 hover:border-forest/40"
                    }`}
                  >
                    <img src="/zomato.png" alt="Zomato" className="w-5 h-5 object-contain" /> Zomato
                  </button>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <span className="font-display text-xs font-bold uppercase tracking-widest text-forest/70 block mb-1">
                    Customer Name
                  </span>
                  <input
                    type="text"
                    value={simName}
                    onChange={(e) => setSimName(e.target.value)}
                    className="w-full rounded-xl border-2 border-forest/15 bg-cream px-3 py-2 text-sm text-forest outline-none"
                  />
                </div>
                <div>
                  <span className="font-display text-xs font-bold uppercase tracking-widest text-forest/70 block mb-1">
                    Phone Number
                  </span>
                  <input
                    type="text"
                    value={simPhone}
                    onChange={(e) => setSimPhone(e.target.value)}
                    className="w-full rounded-xl border-2 border-forest/15 bg-cream px-3 py-2 text-sm text-forest outline-none"
                  />
                </div>
              </div>

              <div>
                <span className="font-display text-xs font-bold uppercase tracking-widest text-forest/70 block mb-1">
                  Delivery Address
                </span>
                <input
                  type="text"
                  value={simAddress}
                  onChange={(e) => setSimAddress(e.target.value)}
                  className="w-full rounded-xl border-2 border-forest/15 bg-cream px-3 py-2 text-sm text-forest outline-none"
                />
              </div>

              {/* Product selection */}
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <span className="font-display text-xs font-bold uppercase tracking-widest text-forest/70 block mb-1">
                    Select Food Item
                  </span>
                  <select
                    value={simProductId}
                    onChange={(e) => setSimProductId(e.target.value)}
                    className="w-full rounded-xl border-2 border-forest/15 bg-cream px-3 py-2 text-sm text-forest outline-none"
                  >
                    <option value="">-- Choose Item --</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.emoji} {p.name} (₹{p.price})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="font-display text-xs font-bold uppercase tracking-widest text-forest/70 block mb-1">
                    Quantity
                  </span>
                  <select
                    value={simQty}
                    onChange={(e) => setSimQty(Number(e.target.value))}
                    className="w-full rounded-xl border-2 border-forest/15 bg-cream px-3 py-2 text-sm text-forest outline-none"
                  >
                    {[1, 2, 3, 4, 5].map((q) => (
                      <option key={q} value={q}>
                        {q}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={randomizeSimulatorDetails}
                  className="flex-1 focus-ring rounded-full border-2 border-forest/30 bg-cream/50 py-3 font-display text-xs font-bold uppercase tracking-wider text-forest transition hover:bg-cream active:scale-95"
                >
                  🎲 Randomize User
                </button>
                
                <button
                  type="button"
                  onClick={handleFireWebhook}
                  disabled={simulating || !simProductId}
                  className="flex-1 focus-ring rounded-full bg-tomato py-3 font-display text-xs font-bold uppercase tracking-wider text-cream transition hover:bg-forest disabled:opacity-50 active:scale-95"
                >
                  {simulating ? "Sending..." : "Fire Webhook ⚡"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<p className="text-forest/60">Loading orders module...</p>}>
      <OrdersContent />
    </Suspense>
  );
}



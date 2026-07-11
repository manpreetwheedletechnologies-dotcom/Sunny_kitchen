"use client";

import { useEffect, useState, useCallback, Suspense, ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { getAdminToken } from "@/lib/admin-auth";
import {
  adminGetOrders,
  adminUpdateOrderStatus,
  ApiError,
  type Order,
  type OrderStatus,
  type OrderSource,
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-script text-4xl text-forest">Orders Management</h2>
        <p className="mt-1 font-display text-sm font-semibold text-forest/60">
          View and manage all incoming orders.
        </p>
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
                </div>

                <div className="mt-0 flex items-center justify-between bg-cream/50 -mx-5 px-5 py-3 rounded-b-xl border-t border-forest/10 text-sm">
                  <span className="text-forest/60 flex items-center gap-2">
                    <span className="font-semibold uppercase text-xs tracking-wider bg-forest/10 px-2 py-1 rounded">
                      {order.paymentMethod === "cod" ? "COD" : "UPI"}
                    </span>
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



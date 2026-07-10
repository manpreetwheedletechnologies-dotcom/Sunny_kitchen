"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SunIcon from "@/components/SunIcon";
import { getAdminToken, clearAdminToken } from "@/lib/admin-auth";
import {
  getProducts,
  adminUpdateProduct,
  adminCreateProduct,
  adminDeleteProduct,
  adminUploadProductImage,
  resolveImageUrl,
  adminGetOrders,
  adminUpdateOrderStatus,
  ApiError,
  type Product,
  type Order,
  type OrderStatus,
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

export default function AdminDashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [tab, setTab] = useState<"orders" | "products">("orders");

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    emoji: "🍽️",
    stockCount: "20",
    isCombo: false,
  });
  const [creating, setCreating] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const loadData = useCallback(async (authToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const [productsRes, ordersRes] = await Promise.all([
        getProducts(),
        adminGetOrders(authToken),
      ]);
      setProducts(productsRes);
      setOrders(ordersRes);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearAdminToken();
        router.push("/admin/login");
        return;
      }
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't reach the server. Is the backend running?"
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const t = getAdminToken();
    if (!t) {
      router.push("/admin/login");
      return;
    }
    setToken(t);
    loadData(t);
  }, [router, loadData]);

  function handleLogout() {
    clearAdminToken();
    router.push("/admin/login");
  }

  async function toggleOutOfStock(product: Product) {
    if (!token) return;
    try {
      const updated = await adminUpdateProduct(token, product._id, {
        outOfStock: !product.outOfStock,
      });
      setProducts((prev) =>
        prev.map((p) => (p._id === updated._id ? updated : p))
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Update failed");
    }
  }

  async function updateStock(product: Product, stockCount: number) {
    if (!token) return;
    try {
      const updated = await adminUpdateProduct(token, product._id, {
        stockCount,
        outOfStock: stockCount <= 0 ? true : product.outOfStock,
      });
      setProducts((prev) =>
        prev.map((p) => (p._id === updated._id ? updated : p))
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Update failed");
    }
  }

  async function updatePrice(product: Product, price: number) {
    if (!token || Number.isNaN(price) || price < 0) return;
    try {
      const updated = await adminUpdateProduct(token, product._id, { price });
      setProducts((prev) =>
        prev.map((p) => (p._id === updated._id ? updated : p))
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Price update failed");
    }
  }

  async function handleImageUpload(product: Product, file: File) {
    if (!token) return;
    setUploadingId(product._id);
    setError(null);
    try {
      const updated = await adminUploadProductImage(token, product._id, file);
      setProducts((prev) =>
        prev.map((p) => (p._id === updated._id ? updated : p))
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Image upload failed");
    } finally {
      setUploadingId(null);
    }
  }

  async function deleteProduct(product: Product) {
    if (!token) return;
    if (!confirm(`Remove "${product.name}" from the menu?`)) return;
    try {
      await adminDeleteProduct(token, product._id);
      setProducts((prev) => prev.filter((p) => p._id !== product._id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Delete failed");
    }
  }

  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setCreating(true);
    setError(null);
    try {
      const created = await adminCreateProduct(token, {
        name: newProduct.name,
        price: Number(newProduct.price),
        emoji: newProduct.emoji || "🍽️",
        stockCount: Number(newProduct.stockCount),
        isCombo: newProduct.isCombo,
      });
      setProducts((prev) => [...prev, created]);
      setNewProduct({ name: "", price: "", emoji: "🍽️", stockCount: "20", isCombo: false });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't add product");
    } finally {
      setCreating(false);
    }
  }

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

  const stats = useMemo(() => {
    const needsAttention = orders.filter(
      (o) => o.status === "pending" || o.status === "confirmed"
    ).length;
    const revenue = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total, 0);
    const outOfStockCount = products.filter((p) => p.outOfStock).length;
    return {
      totalOrders: orders.length,
      needsAttention,
      revenue,
      outOfStockCount,
    };
  }, [orders, products]);

  if (!token) return null;

  return (
    <main className="min-h-screen bg-creamDark/40">
      <div className="mx-auto max-w-6xl px-5 py-8 md:px-8">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <SunIcon className="h-10 w-10" />
            <div>
              <p className="font-display text-xs font-bold uppercase tracking-widest text-forest/50">
                Sunny&apos;s Kitchen
              </p>
              <h1 className="font-script text-4xl leading-none text-forest">
                Admin Dashboard
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="focus-ring font-display text-sm font-semibold text-forest/60 hover:text-tomato"
            >
              View site ↗
            </Link>
            <button
              onClick={handleLogout}
              className="focus-ring rounded-full border-2 border-forest px-4 py-2 font-display text-sm font-bold text-forest transition hover:bg-forest hover:text-cream"
            >
              Log out
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Total orders"
            value={stats.totalOrders}
            emoji="🧾"
            accent="bg-forest text-cream"
          />
          <StatCard
            label="Needs attention"
            value={stats.needsAttention}
            emoji="⏳"
            accent="bg-sun text-forest"
          />
          <StatCard
            label="Revenue"
            value={`₹${stats.revenue}`}
            emoji="💰"
            accent="bg-tomato text-cream"
          />
          <StatCard
            label="Out of stock"
            value={stats.outOfStockCount}
            emoji="📦"
            accent="bg-forestDark text-cream"
          />
        </div>

        {/* Tabs */}
        <div className="mt-8 flex gap-2 border-b-2 border-forest/10">
          {(["orders", "products"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`focus-ring -mb-0.5 flex items-center gap-2 border-b-2 px-4 py-2.5 font-display text-sm font-bold transition ${
                tab === t
                  ? "border-tomato text-tomato"
                  : "border-transparent text-forest/50 hover:text-forest"
              }`}
            >
              <span>{t === "orders" ? "🧾" : "🍽️"}</span>
              {t === "orders" ? `Orders (${orders.length})` : `Products (${products.length})`}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-4 rounded-xl border-2 border-tomato/40 bg-tomato/10 px-4 py-3 font-display text-sm font-semibold text-tomato">
            {error}
          </div>
        )}

        {loading ? (
          <p className="mt-8 font-display text-sm text-forest/60">Loading…</p>
        ) : tab === "orders" ? (
          <div className="mt-6 space-y-4">
            {orders.length === 0 && (
              <p className="rounded-2xl border-2 border-forest/10 bg-card p-6 text-center text-sm text-forest/60">
                No orders yet.
              </p>
            )}
            {orders.map((order) => {
              const style = STATUS_STYLES[order.status];
              return (
                <div
                  key={order._id}
                  className={`rounded-2xl border-2 border-l-[6px] border-forest/15 bg-card p-5 shadow-sm ${style.border}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-display text-lg font-bold text-forest">
                          {order.orderNumber}
                        </p>
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
                        {order.customerName} · {order.phone}
                        {order.email && <> · {order.email}</>}
                      </p>
                      <p className="text-sm text-forest/70">{order.address}</p>
                      {order.notes && (
                        <p className="text-sm italic text-forest/50">
                          &ldquo;{order.notes}&rdquo;
                        </p>
                      )}
                    </div>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        changeOrderStatus(order, e.target.value as OrderStatus)
                      }
                      className="focus-ring rounded-full border-2 border-forest bg-forest px-4 py-2 font-display text-xs font-bold uppercase tracking-wide text-cream"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s} className="bg-card text-forest">
                          {STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-3 divide-y divide-forest/10 border-t border-forest/10 pt-3">
                    {order.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex justify-between py-1.5 text-sm text-forest/80"
                      >
                        <span>
                          {item.qty} × {item.name}
                        </span>
                        <span className="font-display font-semibold text-forest">
                          ₹{item.qty * item.price}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-forest/10 pt-3 text-sm">
                    <span className="text-forest/60">
                      {order.paymentMethod === "cod" ? "Cash on delivery" : "UPI"}
                      {" · "}
                      Delivery ₹{order.deliveryFee}
                    </span>
                    <span className="font-display text-base font-extrabold text-forest">
                      Total ₹{order.total}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <div className="overflow-x-auto rounded-2xl border-2 border-forest/15 bg-card shadow-sm">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-forest/10 bg-creamDark/60 font-display text-xs font-bold uppercase tracking-widest text-forest/60">
                    <th className="px-4 py-3">Photo</th>
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3">Price (₹)</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr
                      key={p._id}
                      className="border-b border-forest/10 transition last:border-none hover:bg-creamDark/30"
                    >
                      <td className="px-4 py-3">
                        <label className="focus-ring group relative flex h-12 w-12 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-forest/15 bg-cream">
                          {resolveImageUrl(p.imageUrl) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={resolveImageUrl(p.imageUrl)!}
                              alt={p.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-xl">{p.emoji}</span>
                          )}
                          <span className="absolute inset-0 flex items-center justify-center bg-forest/0 text-[10px] font-bold text-cream opacity-0 transition group-hover:bg-forest/60 group-hover:opacity-100">
                            {uploadingId === p._id ? "…" : "Change"}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingId === p._id}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(p, file);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      </td>
                      <td className="px-4 py-3">
                        {p.name}
                        {p.isCombo && (
                          <span className="ml-2 rounded-full bg-sun px-2 py-0.5 text-xs font-bold text-forest">
                            combo
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span className="text-forest/50">₹</span>
                          <input
                            type="number"
                            min={0}
                            defaultValue={p.price}
                            onBlur={(e) => {
                              const val = Number(e.target.value);
                              if (val !== p.price) updatePrice(p, val);
                            }}
                            className="focus-ring w-20 rounded-lg border-2 border-forest/15 bg-cream px-2 py-1 font-display font-semibold text-forest outline-none"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min={0}
                          defaultValue={p.stockCount}
                          onBlur={(e) => {
                            const val = Number(e.target.value);
                            if (val !== p.stockCount) updateStock(p, val);
                          }}
                          className="focus-ring w-20 rounded-lg border-2 border-forest/15 bg-cream px-2 py-1 text-forest outline-none"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleOutOfStock(p)}
                          className={`focus-ring rounded-full px-3 py-1 font-display text-xs font-bold uppercase tracking-wide transition ${
                            p.outOfStock
                              ? "bg-tomato/15 text-tomato"
                              : "bg-forest/10 text-forest"
                          }`}
                        >
                          {p.outOfStock ? "Out of stock" : "In stock"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => deleteProduct(p)}
                          aria-label={`Delete ${p.name}`}
                          className="focus-ring text-forest/40 transition hover:text-tomato"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <form
              onSubmit={handleCreateProduct}
              className="rounded-2xl border-2 border-forest/15 bg-card p-5 shadow-sm"
            >
              <p className="font-display text-sm font-bold text-forest">
                ➕ Add a new item
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-5">
                <input
                  required
                  placeholder="Name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="focus-ring rounded-lg border-2 border-forest/15 bg-cream px-3 py-2 text-sm text-forest outline-none sm:col-span-2"
                />
                <input
                  required
                  type="number"
                  min={0}
                  placeholder="Price"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  className="focus-ring rounded-lg border-2 border-forest/15 bg-cream px-3 py-2 text-sm text-forest outline-none"
                />
                <input
                  placeholder="Emoji"
                  value={newProduct.emoji}
                  onChange={(e) => setNewProduct({ ...newProduct, emoji: e.target.value })}
                  className="focus-ring rounded-lg border-2 border-forest/15 bg-cream px-3 py-2 text-sm text-forest outline-none"
                />
                <input
                  required
                  type="number"
                  min={0}
                  placeholder="Stock"
                  value={newProduct.stockCount}
                  onChange={(e) => setNewProduct({ ...newProduct, stockCount: e.target.value })}
                  className="focus-ring rounded-lg border-2 border-forest/15 bg-cream px-3 py-2 text-sm text-forest outline-none"
                />
              </div>
              <label className="mt-3 flex items-center gap-2 text-sm text-forest/70">
                <input
                  type="checkbox"
                  checked={newProduct.isCombo}
                  onChange={(e) => setNewProduct({ ...newProduct, isCombo: e.target.checked })}
                />
                This is the combo deal
              </label>
              <button
                type="submit"
                disabled={creating}
                className="focus-ring mt-4 rounded-full bg-forest px-6 py-2 font-display text-sm font-bold text-cream transition hover:bg-tomato disabled:opacity-60"
              >
                {creating ? "Adding…" : "Add Item"}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  emoji,
  accent,
}: {
  label: string;
  value: string | number;
  emoji: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border-2 border-forest/10 bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${accent}`}>
          {emoji}
        </span>
        <div>
          <p className="font-display text-xl font-extrabold leading-none text-forest">
            {value}
          </p>
          <p className="mt-1 font-display text-xs font-semibold uppercase tracking-wide text-forest/50">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}

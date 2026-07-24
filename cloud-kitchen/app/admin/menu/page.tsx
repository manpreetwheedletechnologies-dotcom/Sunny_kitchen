"use client";

import { useEffect, useState, useCallback } from "react";
import { getAdminToken } from "@/lib/admin-auth";
import {
  getProducts,
  adminUpdateProduct,
  adminCreateProduct,
  adminDeleteProduct,
  adminUploadProductImage,
  adminSyncUrbanPiperCatalog,
  resolveImageUrl,
  ApiError,
  type Product,
} from "@/lib/api";

const CATEGORIES = ["Uncategorized", "Starters", "Main Course", "Breads", "Desserts", "Beverages"];

export default function AdminMenuPage() {
  const [token, setToken] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newProduct, setNewProduct] = useState<{
    name: string;
    price: string;
    stockCount: string;
    isCombo: boolean;
    category: string;
    imageFile: File | null;
    ingredients: string;
  }>({
    name: "",
    price: "",
    stockCount: "20",
    isCombo: false,
    category: "Uncategorized",
    imageFile: null,
    ingredients: "",
  });
  const [creating, setCreating] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const [syncing, setSyncing] = useState(false);
  const [syncStep, setSyncStep] = useState(0);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncStatusText, setSyncStatusText] = useState("");

  const SYNC_STEPS = [
    "Establishing secure link with Petpooja catalog aggregator...",
    "Sending product catalogs to Swiggy API portal...",
    "Sending product catalogs to Zomato API portal...",
    "Uploading ingredients lists & item categories...",
    "Syncing stock counts & availability status...",
    "Sync complete! 🚀 Your website's menu is now live on Swiggy & Zomato."
  ];

  const handleSyncMenu = useCallback(async () => {
    if (!token) return;
    setSyncing(true);
    setShowSyncModal(true);
    setSyncStep(0);
    setSyncStatusText(SYNC_STEPS[0]);

    try {
      const syncPromise = adminSyncUrbanPiperCatalog(token);

      const runSync = (step: number) => {
        if (step < SYNC_STEPS.length - 2) {
          setTimeout(() => {
            setSyncStep(step + 1);
            setSyncStatusText(SYNC_STEPS[step + 1]);
            runSync(step + 1);
          }, 800);
        } else {
          syncPromise
            .then((res) => {
              setSyncStep(SYNC_STEPS.length - 1);
              setSyncStatusText(res.message || SYNC_STEPS[SYNC_STEPS.length - 1]);
              setSyncing(false);
              setTimeout(() => {
                setShowSyncModal(false);
              }, 4000);
            })
            .catch((err) => {
              setSyncStatusText(`Sync failed: ${err.message || "Unknown error"}`);
              setSyncing(false);
              setTimeout(() => {
                setShowSyncModal(false);
              }, 4000);
            });
        }
      };

      runSync(0);
    } catch (err: any) {
      setSyncStatusText(`Sync failed: ${err.message}`);
      setSyncing(false);
      setTimeout(() => {
        setShowSyncModal(false);
      }, 3000);
    }
  }, [products, token]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load menu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = getAdminToken();
    if (t) {
      setToken(t);
      loadData();
    }
  }, [loadData]);

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

  async function updateCategory(product: Product, category: string) {
    if (!token) return;
    try {
      const updated = await adminUpdateProduct(token, product._id, { category });
      setProducts((prev) =>
        prev.map((p) => (p._id === updated._id ? updated : p))
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Category update failed");
    }
  }

  async function updateIngredients(product: Product, ingredients: string) {
    if (!token) return;
    try {
      const updated = await adminUpdateProduct(token, product._id, { ingredients });
      setProducts((prev) =>
        prev.map((p) => (p._id === updated._id ? updated : p))
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ingredients update failed");
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
        emoji: "🍽️",
        stockCount: Number(newProduct.stockCount),
        isCombo: newProduct.isCombo,
        category: newProduct.category,
        ingredients: newProduct.ingredients,
      });

      let finalProduct = created;
      if (newProduct.imageFile) {
        finalProduct = await adminUploadProductImage(token, created._id, newProduct.imageFile);
      }

      setProducts((prev) => [...prev, finalProduct]);
      setNewProduct({ name: "", price: "", stockCount: "20", isCombo: false, category: "Uncategorized", imageFile: null, ingredients: "" });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't add product");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="font-script text-4xl text-forest">Menu Management</h2>
          <p className="mt-1 font-display text-sm font-semibold text-forest/60">
            Manage your products, categories, pricing, and availability.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSyncMenu}
          disabled={syncing || products.length === 0}
          className="focus-ring rounded-full bg-forest border border-forest/10 hover:bg-tomato transition px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-cream flex items-center gap-2 shadow hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          {syncing ? "🔄 Syncing Menu..." : "🔄 Sync to Swiggy/Zomato"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border-2 border-tomato/40 bg-tomato/10 px-4 py-3 font-display text-sm font-semibold text-tomato">
          {error}
        </div>
      )}

      {/* Add New Item Form */}
      <form
        onSubmit={handleCreateProduct}
        className="rounded-2xl border-2 border-forest/15 bg-card p-5 shadow-sm"
      >
        <p className="font-display text-sm font-bold text-forest mb-3">
          ➕ Add a new item
        </p>
        <div className="grid gap-3 sm:grid-cols-6">
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
            placeholder="Price (₹)"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            className="focus-ring rounded-lg border-2 border-forest/15 bg-cream px-3 py-2 text-sm text-forest outline-none"
          />
          <select
            value={newProduct.category}
            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
            className="focus-ring rounded-lg border-2 border-forest/15 bg-cream px-3 py-2 text-sm text-forest outline-none"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="relative border-2 border-dashed border-forest/20 rounded-lg flex items-center justify-center bg-cream px-3 py-2 cursor-pointer hover:bg-cream/80 transition overflow-hidden">
            <input 
              type="file" 
              accept="image/*" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setNewProduct({ ...newProduct, imageFile: file });
              }}
            />
            {newProduct.imageFile ? (
              <p className="text-xs text-forest font-semibold truncate w-full text-center">{newProduct.imageFile.name}</p>
            ) : (
              <div className="text-center w-full">
                <span className="text-xs text-forest/60 font-semibold">📷 Image</span>
              </div>
            )}
          </div>
          <input
            required
            type="number"
            min={0}
            placeholder="Stock"
            value={newProduct.stockCount}
            onChange={(e) => setNewProduct({ ...newProduct, stockCount: e.target.value })}
            className="focus-ring rounded-lg border-2 border-forest/15 bg-cream px-3 py-2 text-sm text-forest outline-none"
          />
          <input
            placeholder="Ingredients (e.g. Tomato, Cheese)"
            value={newProduct.ingredients}
            onChange={(e) => setNewProduct({ ...newProduct, ingredients: e.target.value })}
            className="focus-ring rounded-lg border-2 border-forest/15 bg-cream px-3 py-2 text-sm text-forest outline-none sm:col-span-2"
          />
        </div>
        <div className="mt-4 flex items-center justify-between flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-forest/70 cursor-pointer">
            <input
              type="checkbox"
              checked={newProduct.isCombo}
              onChange={(e) => setNewProduct({ ...newProduct, isCombo: e.target.checked })}
              className="accent-forest w-4 h-4 rounded"
            />
            Mark as Combo Deal
          </label>
          <button
            type="submit"
            disabled={creating}
            className="focus-ring rounded-xl bg-forest px-6 py-2.5 font-display text-sm font-bold text-cream transition hover:bg-forestDark disabled:opacity-60"
          >
            {creating ? "Adding…" : "Add Item"}
          </button>
        </div>
      </form>

      {loading ? (
        <p className="font-display text-sm text-forest/60">Loading menu...</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border-2 border-forest/15 bg-card shadow-sm">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b-2 border-forest/10 bg-creamDark/60 font-display text-xs font-bold uppercase tracking-widest text-forest/60">
                <th className="px-4 py-3">Photo</th>
                <th className="px-4 py-3">Item Details</th>
                <th className="px-4 py-3">Ingredients</th>
                <th className="px-4 py-3">Category</th>
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
                    <label className="focus-ring group relative flex h-14 w-14 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-forest/15 bg-cream">
                      {resolveImageUrl(p.imageUrl) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={resolveImageUrl(p.imageUrl)!}
                          alt={p.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">{p.emoji}</span>
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
                    <div className="font-semibold text-forest text-base">{p.name}</div>
                    <div className="flex gap-1.5 mt-1 items-center flex-wrap">
                      {p.isCombo && (
                        <span className="rounded-full bg-sun px-2 py-0.5 text-[10px] font-bold text-forest uppercase tracking-wide">
                          combo
                        </span>
                      )}
                      <span className="rounded-full bg-forest/10 px-2 py-0.5 text-[9px] font-bold text-forest uppercase tracking-wide border border-forest/10">
                        Synced 🔄
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      placeholder="e.g. Flour, Sugar"
                      defaultValue={p.ingredients}
                      onBlur={(e) => {
                        const val = e.target.value;
                        if (val !== p.ingredients) updateIngredients(p, val);
                      }}
                      className="focus-ring w-32 md:w-40 rounded-lg border border-forest/20 bg-cream/50 px-2 py-1.5 text-sm text-forest outline-none"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={p.category || "Uncategorized"}
                      onChange={(e) => updateCategory(p, e.target.value)}
                      className="focus-ring rounded-lg border border-forest/20 bg-cream/50 px-2 py-1.5 text-sm text-forest outline-none"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
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
                        className="focus-ring w-20 rounded-lg border border-forest/20 bg-cream/50 px-2 py-1.5 font-display font-semibold text-forest outline-none"
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
                      className="focus-ring w-20 rounded-lg border border-forest/20 bg-cream/50 px-2 py-1.5 text-forest outline-none"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleOutOfStock(p)}
                      className={`focus-ring rounded-full px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-wide transition ${
                        p.outOfStock
                          ? "bg-tomato/15 text-tomato hover:bg-tomato/25"
                          : "bg-forest/10 text-forest hover:bg-forest/20"
                      }`}
                    >
                      {p.outOfStock ? "Out of stock" : "In stock"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => deleteProduct(p)}
                      aria-label={`Delete ${p.name}`}
                      className="focus-ring rounded-lg p-2 text-forest/40 transition hover:bg-tomato/10 hover:text-tomato"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Sync Catalog Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md border-2 border-forest/15 bg-card rounded-3xl p-6 md:p-8 shadow-2xl relative text-center animate-in zoom-in-95 duration-200">
            <h3 className="font-display text-2xl font-bold text-forest mb-4 flex items-center justify-center gap-2">
              <span>🔄 Platform Menu Sync</span>
            </h3>

            <div className="flex justify-center items-center h-20">
              {syncing ? (
                <div className="h-12 w-12 rounded-full border-4 border-forest/10 border-t-tomato animate-spin" />
              ) : (
                <div className="text-4xl animate-bounce">✅</div>
              )}
            </div>

            <p className="font-display text-sm font-semibold text-forest mt-4 transition-all duration-300">
              {syncStatusText || SYNC_STEPS[syncStep]}
            </p>
            
            <p className="text-xs text-forest/50 mt-2 font-body">
              Syncing {products.length} products to active food aggregators.
            </p>

            {syncing && (
              <div className="mt-6 w-full bg-cream rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-tomato h-full transition-all duration-500 ease-out" 
                  style={{ width: `${((syncStep + 1) / SYNC_STEPS.length) * 100}%` }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

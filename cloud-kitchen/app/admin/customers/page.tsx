"use client";

import { useEffect, useState, useCallback } from "react";
import { getAdminToken } from "@/lib/admin-auth";
import { adminGetCustomers, adminUpdateCustomer, adminDeleteCustomer, ApiError, type Customer } from "@/lib/api";

const PLATFORM_ICONS: Record<string, string> = {
  website: "🌐 Website",
  swiggy: "🟧 Swiggy",
  zomato: "🛵 Zomato",
};

export default function AdminCustomersPage() {
  const [token, setToken] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = useCallback(async (authToken: string) => {
    setLoading(true);
    try {
      const data = await adminGetCustomers(authToken);
      setCustomers(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = getAdminToken();
    if (t) {
      setToken(t);
      loadData(t);
    }
  }, [loadData]);

  async function updateCustomer(id: string, payload: Partial<Customer>) {
    if (!token) return;
    try {
      const updated = await adminUpdateCustomer(token, id, payload);
      setCustomers((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Update failed");
    }
  }

  async function deleteCustomer(id: string, name: string) {
    if (!token) return;
    if (!confirm(`Delete customer ${name}?`)) return;
    try {
      await adminDeleteCustomer(token, id);
      setCustomers((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Delete failed");
    }
  }

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-script text-4xl text-forest">Customer Management</h2>
        <p className="mt-1 font-display text-sm font-semibold text-forest/60">
          View your customer base, automatically imported from incoming orders.
        </p>
      </div>

      <div className="flex bg-card p-4 rounded-xl border-2 border-forest/10 shadow-sm">
        <input
          type="text"
          placeholder="Search by name, phone, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md focus-ring rounded-lg border-2 border-forest/15 bg-cream px-3 py-2 text-sm text-forest outline-none"
        />
      </div>

      {error && (
        <div className="rounded-xl border-2 border-tomato/40 bg-tomato/10 px-4 py-3 font-display text-sm font-semibold text-tomato">
          {error}
        </div>
      )}

      {loading ? (
        <p className="font-display text-sm text-forest/60">Loading customers...</p>
      ) : filteredCustomers.length === 0 ? (
        <div className="rounded-2xl border-2 border-forest/10 bg-card p-8 text-center">
          <p className="font-display text-forest/60">No customers found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border-2 border-forest/15 bg-card shadow-sm">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b-2 border-forest/10 bg-creamDark/60 font-display text-xs font-bold uppercase tracking-widest text-forest/60">
                <th className="px-4 py-3">Customer Info</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Stats</th>
                <th className="px-4 py-3">Platform</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c) => (
                <tr key={c._id} className="border-b border-forest/10 transition last:border-none hover:bg-creamDark/30">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-forest text-base">{c.name}</div>
                    <div className="text-xs text-forest/50 mt-1">Since {new Date(c.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-forest font-semibold">{c.phone}</div>
                    {c.email && <div className="text-forest/70 text-xs mt-1">{c.email}</div>}
                  </td>
                  <td className="px-4 py-3 text-forest/80 max-w-xs truncate" title={c.address}>
                    {c.address || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-forest">{c.totalOrders} <span className="font-normal text-forest/60 text-xs">orders</span></div>
                    {c.lastOrderDate && (
                      <div className="text-xs text-forest/60 mt-1">Last: {new Date(c.lastOrderDate).toLocaleDateString()}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-forest/80">
                    <select
                      value={c.preferredPlatform}
                      onChange={(e) => updateCustomer(c._id, { preferredPlatform: e.target.value as any })}
                      className="bg-transparent outline-none cursor-pointer"
                    >
                      <option value="website">🌐 Website</option>
                      <option value="swiggy">🟧 Swiggy</option>
                      <option value="zomato">🛵 Zomato</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => deleteCustomer(c._id, c.name)}
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
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { getAdminToken } from "@/lib/admin-auth";
import { adminGetPayments, ApiError, type Payment, type PaymentRecordStatus } from "@/lib/api";

const STATUS_STYLES: Record<PaymentRecordStatus, { badge: string; label: string; dot: string }> = {
  captured: { badge: "bg-forest/10 text-forest", label: "Success", dot: "bg-forest" },
  failed: { badge: "bg-tomato/15 text-tomato", label: "Failed", dot: "bg-tomato" },
  created: { badge: "bg-sun/20 text-sunDeep", label: "Pending / Abandoned", dot: "bg-sun" },
};

const METHOD_LABELS: Record<string, string> = {
  upi: "UPI",
  card: "Card",
  netbanking: "Netbanking",
  wallet: "Wallet",
  emi: "EMI",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminPaymentsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<PaymentRecordStatus | "">("");
  const [searchQuery, setSearchQuery] = useState("");

  const loadPayments = useCallback(async (authToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminGetPayments(authToken);
      setPayments(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = getAdminToken();
    if (t) {
      setToken(t);
      loadPayments(t);
    }
  }, [loadPayments]);

  const filtered = payments.filter((p) => {
    if (statusFilter && p.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const orderNum = p.orderNumber?.toLowerCase() || "";
      const rzpOrderId = p.razorpayOrderId?.toLowerCase() || "";
      const rzpPaymentId = p.razorpayPaymentId?.toLowerCase() || "";
      const customerName =
        typeof p.order === "object" ? p.order.customerName?.toLowerCase() || "" : "";
      if (
        !orderNum.includes(q) &&
        !rzpOrderId.includes(q) &&
        !rzpPaymentId.includes(q) &&
        !customerName.includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  const totals = {
    captured: payments.filter((p) => p.status === "captured").length,
    failed: payments.filter((p) => p.status === "failed").length,
    pending: payments.filter((p) => p.status === "created").length,
    revenue: payments
      .filter((p) => p.status === "captured")
      .reduce((sum, p) => sum + p.amount, 0),
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-script text-4xl text-forest">Payments</h2>
        <p className="mt-1 font-display text-sm font-semibold text-forest/60">
          Every Razorpay payment attempt, linked to its order.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border-2 border-forest/10 bg-card p-5">
          <p className="font-display text-xs font-bold uppercase tracking-widest text-forest/50">
            Total Revenue
          </p>
          <p className="mt-1 font-display text-2xl font-extrabold text-forest">
            ₹{totals.revenue.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="rounded-2xl border-2 border-forest/10 bg-card p-5">
          <p className="font-display text-xs font-bold uppercase tracking-widest text-forest/50">
            Successful
          </p>
          <p className="mt-1 font-display text-2xl font-extrabold text-forest">
            {totals.captured}
          </p>
        </div>
        <div className="rounded-2xl border-2 border-forest/10 bg-card p-5">
          <p className="font-display text-xs font-bold uppercase tracking-widest text-forest/50">
            Failed
          </p>
          <p className="mt-1 font-display text-2xl font-extrabold text-tomato">
            {totals.failed}
          </p>
        </div>
        <div className="rounded-2xl border-2 border-forest/10 bg-card p-5">
          <p className="font-display text-xs font-bold uppercase tracking-widest text-forest/50">
            Pending / Abandoned
          </p>
          <p className="mt-1 font-display text-2xl font-extrabold text-sunDeep">
            {totals.pending}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border-2 border-forest/10 bg-card p-4 shadow-sm">
        <input
          type="text"
          placeholder="Search by order #, customer, or payment ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="focus-ring min-w-[240px] flex-1 rounded-lg border-2 border-forest/15 bg-cream px-4 py-2 text-sm text-forest outline-none placeholder:text-forest/30"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as PaymentRecordStatus | "")}
          className="focus-ring rounded-lg border-2 border-forest/15 bg-cream px-3 py-2 text-sm font-semibold text-forest outline-none"
        >
          <option value="">All statuses</option>
          <option value="captured">Success</option>
          <option value="failed">Failed</option>
          <option value="created">Pending / Abandoned</option>
        </select>
        <button
          onClick={() => token && loadPayments(token)}
          className="focus-ring rounded-full border-2 border-forest/20 px-4 py-2 font-display text-xs font-bold uppercase tracking-wider text-forest transition hover:bg-forest/5"
        >
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border-2 border-tomato/30 bg-tomato/10 px-4 py-3 text-sm font-semibold text-tomato">
          {error}
        </div>
      )}

      {loading ? (
        <p className="font-display text-sm font-semibold text-forest/60">Loading payments…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-forest/15 bg-card p-10 text-center">
          <p className="font-display text-sm font-semibold text-forest/50">
            No payments match your filters.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border-2 border-forest/10 bg-card">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b-2 border-forest/10 bg-cream/60">
                <th className="px-4 py-3 font-display text-xs font-bold uppercase tracking-wider text-forest/60">
                  Order
                </th>
                <th className="px-4 py-3 font-display text-xs font-bold uppercase tracking-wider text-forest/60">
                  Customer
                </th>
                <th className="px-4 py-3 font-display text-xs font-bold uppercase tracking-wider text-forest/60">
                  Amount
                </th>
                <th className="px-4 py-3 font-display text-xs font-bold uppercase tracking-wider text-forest/60">
                  Method
                </th>
                <th className="px-4 py-3 font-display text-xs font-bold uppercase tracking-wider text-forest/60">
                  Status
                </th>
                <th className="px-4 py-3 font-display text-xs font-bold uppercase tracking-wider text-forest/60">
                  Razorpay Payment ID
                </th>
                <th className="px-4 py-3 font-display text-xs font-bold uppercase tracking-wider text-forest/60">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const style = STATUS_STYLES[p.status];
                const customerName =
                  typeof p.order === "object" ? p.order.customerName : undefined;
                return (
                  <tr key={p._id} className="border-b border-forest/5 last:border-0 hover:bg-cream/30">
                    <td className="px-4 py-3 font-display font-bold text-forest">
                      {p.orderNumber}
                    </td>
                    <td className="px-4 py-3 text-forest/80">{customerName || "—"}</td>
                    <td className="px-4 py-3 font-semibold text-forest">
                      ₹{p.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-forest/70">
                      {p.method ? METHOD_LABELS[p.method] || p.method : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-display text-xs font-bold ${style.badge}`}
                        title={p.status === "failed" ? p.errorDescription || p.errorReason : undefined}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                        {style.label}
                      </span>
                      {p.status === "failed" && p.errorDescription && (
                        <p className="mt-1 max-w-[220px] truncate text-xs text-forest/40" title={p.errorDescription}>
                          {p.errorDescription}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-forest/60">
                      {p.razorpayPaymentId || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-forest/60">
                      {formatDate(p.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

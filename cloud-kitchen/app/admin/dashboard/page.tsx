"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getAdminToken } from "@/lib/admin-auth";
import { adminGetDashboardStats, ApiError } from "@/lib/api";

type DashboardStats = {
  totalOrders: number;
  websiteOrders: number;
  swiggyOrders: number;
  zomatoOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  revenue: number;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) return;

    setLoading(true);
    adminGetDashboardStats(token)
      .then((data) => setStats(data))
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load stats");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="font-display text-sm text-forest/60">Loading dashboard...</p>;
  if (error) return <div className="rounded-xl border-2 border-tomato/40 bg-tomato/10 px-4 py-3 font-display text-sm font-semibold text-tomato">{error}</div>;
  if (!stats) return null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-script text-4xl text-forest">Dashboard Overview</h2>
        <p className="mt-1 font-display text-sm font-semibold text-forest/60">
          Welcome back to Sunny&apos;s Kitchen admin panel.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Orders" value={stats.totalOrders} emoji="🧾" accent="bg-forest text-cream" />
        <StatCard label="Revenue" value={`₹${stats.revenue}`} emoji="💰" accent="bg-tomato text-cream" />
        <StatCard label="Pending Orders" value={stats.pendingOrders} emoji="⏳" accent="bg-sun text-forest" />
        <StatCard label="Delivered" value={stats.deliveredOrders} emoji="✅" accent="bg-forestDark text-cream" />
      </div>

      <div>
        <h3 className="font-display text-xl font-bold text-forest mb-4">Orders by Platform</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Website" value={stats.websiteOrders} emoji="🌐" accent="bg-card text-forest border-forest/15" />
          <StatCard label="Zomato" value={stats.zomatoOrders} emoji={<img src="/zomato.png" alt="Zomato" className="w-6 h-6 object-contain" />} accent="bg-card text-tomato border-tomato/20" />
          <StatCard label="Swiggy" value={stats.swiggyOrders} emoji={<img src="/swiggy.png" alt="Swiggy" className="w-6 h-6 object-contain" />} accent="bg-card text-[#fc8019] border-[#fc8019]/20" />
        </div>
      </div>

      <div>
        <h3 className="font-display text-xl font-bold text-forest mb-4">Order Status Breakdown</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Confirmed" value={stats.confirmedOrders} emoji="👍" accent="bg-card text-forest border-forest/15" />
          <StatCard label="Cancelled" value={stats.cancelledOrders} emoji="❌" accent="bg-card text-forest/50 border-forest/10" />
        </div>
      </div>
    </div>
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
  emoji: ReactNode;
  accent: string;
}) {
  return (
    <div className={`rounded-2xl border-2 p-4 shadow-sm ${accent.includes('border') ? accent : 'border-forest/10 bg-card'}`}>
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${accent}`}>
          {emoji}
        </span>
        <div>
          <p className="font-display text-2xl font-extrabold leading-none text-forest">
            {value}
          </p>
          <p className="mt-1 font-display text-xs font-semibold uppercase tracking-wide text-forest/70">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getAdminToken } from "@/lib/admin-auth";
import { adminGetDashboardStats, adminGetLeads, ApiError, Lead } from "@/lib/api";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [latestLeads, setLatestLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) return;

    setLoading(true);
    Promise.all([
      adminGetDashboardStats(token),
      adminGetLeads(token).then(data => data.slice(0, 5))
    ])
      .then(([statsData, leadsData]) => {
        setStats(statsData);
        setLatestLeads(leadsData);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load dashboard data");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="font-display text-sm text-forest/60">Loading dashboard...</p>;
  if (error) return <div className="rounded-xl border-2 border-tomato/40 bg-tomato/10 px-4 py-3 font-display text-sm font-semibold text-tomato">{error}</div>;
  if (!stats) return null;

  const platformData = stats ? [
    { name: "Website", value: stats.websiteOrders, color: "#1b4332" },
    { name: "Zomato", value: stats.zomatoOrders, color: "#e23744" },
    { name: "Swiggy", value: stats.swiggyOrders, color: "#fc8019" },
  ] : [];

  const statusData = stats ? [
    { name: "Pending", value: stats.pendingOrders, fill: "#ffb703" },
    { name: "Confirmed", value: stats.confirmedOrders, fill: "#1b4332" },
    { name: "Delivered", value: stats.deliveredOrders, fill: "#081c15" },
    { name: "Cancelled", value: stats.cancelledOrders, fill: "#e23744" },
  ] : [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="font-script text-4xl text-forest">Dashboard Overview</h2>
        <p className="mt-1 font-display text-sm font-semibold text-forest/60">
          Welcome back to Sunny&apos;s Kitchen admin panel.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Orders" value={stats.totalOrders} emoji="🧾" accent="bg-forest text-cream border-forest/10" />
        <StatCard label="Revenue" value={`₹${stats.revenue.toLocaleString()}`} emoji="💰" accent="bg-tomato text-cream border-tomato/10" />
        <StatCard label="Pending Orders" value={stats.pendingOrders} emoji="⏳" accent="bg-sun text-forest border-sun/20" />
        <StatCard label="Delivered" value={stats.deliveredOrders} emoji="✅" accent="bg-forestDark text-cream border-forestDark/10" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Charts Section */}
        <div className="rounded-2xl border-2 border-forest/10 bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-display text-xl font-bold text-forest mb-6">Orders by Platform</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '2px solid rgba(27,67,50,0.1)', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {platformData.map(p => (
              <div key={p.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }}></div>
                <span className="font-display text-sm font-bold text-forest">{p.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border-2 border-forest/10 bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-display text-xl font-bold text-forest mb-6">Order Status</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(27,67,50,0.1)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#1b4332', fontSize: 12, fontWeight: 'bold' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#1b4332', fontSize: 12, fontWeight: 'bold' }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(27,67,50,0.05)' }}
                  contentStyle={{ borderRadius: '12px', border: '2px solid rgba(27,67,50,0.1)', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-display text-xl font-bold text-forest mb-4">Leads Overview</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6">
          <StatCard label="Total Leads" value={stats.totalLeads} emoji="👥" accent="bg-card text-forest border-forest/15" />
          <StatCard label="New Leads" value={stats.newLeads} emoji="🔔" accent="bg-sun text-forest border-sun/20" />
          <StatCard label="Contacted Leads" value={stats.contactedLeads} emoji="📞" accent="bg-card text-tomato border-tomato/20" />
        </div>
        
        <div className="rounded-2xl border-2 border-forest/10 bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
          <h4 className="font-display text-lg font-bold text-forest mb-4 flex items-center gap-2">
            <span>Recent Inquiries</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-tomato/10 text-xs text-tomato">{latestLeads.length}</span>
          </h4>
          {latestLeads.length === 0 ? (
            <div className="py-8 text-center bg-cream/30 rounded-xl border border-dashed border-forest/20">
              <p className="text-sm font-semibold text-forest/60">No recent leads found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-forest/10 bg-card">
              <table className="w-full text-left font-display text-sm text-forest">
                <thead className="border-b border-forest/10 bg-cream/30 text-xs font-bold uppercase tracking-wide text-forest/60">
                  <tr>
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Contact</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest/5">
                  {latestLeads.map((lead) => (
                    <tr key={lead._id} className="transition hover:bg-cream/40 group">
                      <td className="px-5 py-4 font-bold text-forest group-hover:text-tomato transition-colors">{lead.name}</td>
                      <td className="px-5 py-4 text-forest/80 font-medium">{lead.contactInfo}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          lead.status === 'New' ? 'bg-sun/20 text-forest' : 
                          lead.status === 'Contacted' ? 'bg-forest/10 text-forest' : 
                          'bg-cream text-forest/60'
                        }`}>
                          {lead.status === 'New' && <span className="w-1.5 h-1.5 rounded-full bg-sun mr-1.5 animate-pulse"></span>}
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-forest/60 text-right whitespace-nowrap font-medium">
                        {new Date(lead.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
    <div className={`group rounded-2xl border-2 p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-out ${accent.includes('bg-card') ? accent : `bg-card ${accent.split(' ').find(c => c.startsWith('border-')) || 'border-forest/10'}`}`}>
      <div className="flex items-center gap-4">
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${accent.split(' ').filter(c => !c.startsWith('border-')).join(' ')}`}>
          {emoji}
        </span>
        <div>
          <p className="font-display text-3xl font-extrabold leading-none text-forest tracking-tight">
            {value}
          </p>
          <p className="mt-1 font-display text-xs font-bold uppercase tracking-widest text-forest/60">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}

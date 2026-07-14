"use client";

import { useEffect, useState, useCallback } from "react";
import { getAdminToken } from "@/lib/admin-auth";
import { adminGetLeads, adminUpdateLeadStatus, ApiError, Lead, LeadStatus } from "@/lib/api";

const LEAD_STATUSES: LeadStatus[] = ["New", "Contacted", "Qualified", "Closed"];

export default function AdminLeadsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = useCallback(async (authToken: string) => {
    setLoading(true);
    try {
      const data = await adminGetLeads(authToken, searchQuery || undefined);
      setLeads(data);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const t = getAdminToken();
    if (t) {
      setToken(t);
      loadData(t);
    }
  }, [loadData]);

  async function handleStatusChange(id: string, newStatus: LeadStatus) {
    if (!token) return;
    try {
      const updated = await adminUpdateLeadStatus(token, id, newStatus);
      setLeads((prev) => prev.map((l) => (l._id === id ? updated : l)));
    } catch (err) {
      alert("Failed to update status");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-script text-4xl text-forest">Leads Management</h2>
        <p className="mt-1 font-display text-sm font-semibold text-forest/60">
          Manage contact form submissions and leads.
        </p>
      </div>

      <div className="flex gap-4 bg-card p-4 rounded-xl border-2 border-forest/10 shadow-sm">
        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 focus-ring rounded-lg border-2 border-forest/15 bg-cream px-3 py-2 text-sm text-forest outline-none"
        />
      </div>

      {error && (
        <div className="rounded-xl border-2 border-tomato/40 bg-tomato/10 px-4 py-3 font-display text-sm font-semibold text-tomato">
          {error}
        </div>
      )}

      {loading ? (
        <p className="font-display text-sm text-forest/60">Loading leads...</p>
      ) : leads.length === 0 ? (
        <div className="rounded-2xl border-2 border-forest/10 bg-card p-8 text-center">
          <p className="font-display text-forest/60">No leads found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border-2 border-forest/10 bg-card shadow-sm">
          <table className="w-full text-left font-display text-sm text-forest">
            <thead className="border-b-2 border-forest/10 bg-cream/30 text-xs font-bold uppercase tracking-wide text-forest/60">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest/10">
              {leads.map((lead) => (
                <tr key={lead._id} className="transition hover:bg-cream/20">
                  <td className="px-4 py-3 font-bold">{lead.name}</td>
                  <td className="px-4 py-3 text-forest/80">{lead.contactInfo}</td>
                  <td className="px-4 py-3 text-forest/80 max-w-xs truncate" title={lead.message}>
                    {lead.message}
                  </td>
                  <td className="px-4 py-3 text-forest/60 whitespace-nowrap">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead._id, e.target.value as LeadStatus)}
                      className="focus-ring rounded-lg border-2 border-forest/15 bg-cream px-2 py-1 text-sm font-semibold text-forest outline-none"
                    >
                      {LEAD_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
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

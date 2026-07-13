"use client";

import { useEffect, useState, useCallback } from "react";
import { getAdminToken } from "@/lib/admin-auth";
import {
  adminGetTestimonials,
  adminCreateTestimonial,
  adminUpdateTestimonial,
  adminDeleteTestimonial,
  Testimonial,
  ApiError,
} from "@/lib/api";

export default function AdminTestimonialsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newTestimonial, setNewTestimonial] = useState({
    name: "",
    content: "",
    rating: "5",
  });
  const [creating, setCreating] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminGetTestimonials(token!);
      setTestimonials(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const t = getAdminToken();
    if (t) {
      setToken(t);
    }
  }, []);

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token, loadData]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setCreating(true);
    setError(null);
    try {
      const created = await adminCreateTestimonial(token, {
        name: newTestimonial.name,
        content: newTestimonial.content,
        rating: Number(newTestimonial.rating),
      });
      setTestimonials((prev) => [created, ...prev]);
      setNewTestimonial({ name: "", content: "", rating: "5" });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't add testimonial");
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(id: string, current: boolean) {
    if (!token) return;
    try {
      const updated = await adminUpdateTestimonial(token, id, { isActive: !current });
      setTestimonials((prev) => prev.map((t) => (t._id === id ? updated : t)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Update failed");
    }
  }

  async function handleDelete(id: string) {
    if (!token) return;
    if (!confirm("Delete this testimonial?")) return;
    try {
      await adminDeleteTestimonial(token, id);
      setTestimonials((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Delete failed");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-script text-4xl text-forest">Testimonials</h2>
        <p className="mt-1 font-display text-sm font-semibold text-forest/60">
          Manage guest reviews displayed on the homepage carousel.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border-2 border-tomato/40 bg-tomato/10 px-4 py-3 font-display text-sm font-semibold text-tomato">
          {error}
        </div>
      )}

      {/* Add Form */}
      <form
        onSubmit={handleCreate}
        className="rounded-2xl border-2 border-forest/15 bg-card p-5 shadow-sm"
      >
        <p className="font-display text-sm font-bold text-forest mb-3">➕ Add a Testimonial</p>
        <div className="grid gap-3 sm:grid-cols-6">
          <input
            required
            placeholder="Guest Name"
            value={newTestimonial.name}
            onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
            className="focus-ring rounded-lg border-2 border-forest/15 bg-cream px-3 py-2 text-sm text-forest outline-none sm:col-span-2"
          />
          <input
            required
            type="number"
            min={1}
            max={5}
            placeholder="Rating (1-5)"
            value={newTestimonial.rating}
            onChange={(e) => setNewTestimonial({ ...newTestimonial, rating: e.target.value })}
            className="focus-ring rounded-lg border-2 border-forest/15 bg-cream px-3 py-2 text-sm text-forest outline-none"
          />
          <input
            required
            placeholder="Review Content..."
            value={newTestimonial.content}
            onChange={(e) => setNewTestimonial({ ...newTestimonial, content: e.target.value })}
            className="focus-ring rounded-lg border-2 border-forest/15 bg-cream px-3 py-2 text-sm text-forest outline-none sm:col-span-3"
          />
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={creating}
            className="focus-ring rounded-xl bg-forest px-6 py-2.5 font-display text-sm font-bold text-cream transition hover:bg-forestDark disabled:opacity-60"
          >
            {creating ? "Adding…" : "Add Testimonial"}
          </button>
        </div>
      </form>

      {/* List */}
      {loading ? (
        <p className="font-display text-sm text-forest/60">Loading testimonials...</p>
      ) : (
        <div className="grid gap-4">
          {testimonials.map((t) => (
            <div key={t._id} className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-forest/10 bg-card p-4 shadow-sm">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display font-bold text-forest text-lg">{t.name}</h3>
                  <div className="flex text-sun text-sm">
                    {Array.from({ length: t.rating }).map((_, i) => <span key={i}>⭐</span>)}
                  </div>
                </div>
                <p className="text-forest/80 text-sm font-body">{t.content}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleActive(t._id, t.isActive)}
                  className={`focus-ring rounded-full px-4 py-1.5 font-display text-xs font-bold uppercase tracking-wide transition ${
                    t.isActive
                      ? "bg-forest/10 text-forest hover:bg-forest/20"
                      : "bg-tomato/15 text-tomato hover:bg-tomato/25"
                  }`}
                >
                  {t.isActive ? "Visible on Site" : "Hidden"}
                </button>
                <button
                  onClick={() => handleDelete(t._id)}
                  className="focus-ring rounded-lg p-2 text-forest/40 transition hover:bg-tomato/10 hover:text-tomato"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
          {testimonials.length === 0 && (
            <p className="text-sm text-forest/50 italic text-center py-4">No testimonials found.</p>
          )}
        </div>
      )}
    </div>
  );
}

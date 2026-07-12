"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SunIcon from "@/components/SunIcon";
import { adminLogin, ApiError } from "@/lib/api";
import { setAdminToken, setAdminRole } from "@/lib/admin-auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { accessToken, role } = await adminLogin(email, password);
      setAdminToken(accessToken);
      if (role) {
        setAdminRole(role);
      }
      router.push("/admin/dashboard");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't reach the server. Is the backend running?"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-14">
      <div className="text-center">
        <SunIcon className="mx-auto h-12 w-12" />
        <h1 className="mt-3 font-script text-5xl text-forest">
          Kitchen Admin
        </h1>
        <p className="mt-2 text-sm text-forest/60">
          Manage the menu and incoming orders.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-4 rounded-3xl border-2 border-forest/15 bg-card p-6"
      >
        {error && (
          <p className="rounded-xl border-2 border-tomato/40 bg-tomato/10 px-4 py-2 font-display text-sm font-semibold text-tomato">
            {error}
          </p>
        )}
        <label className="block">
          <span className="font-display text-xs font-bold uppercase tracking-widest text-forest/70">
            Email
          </span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="focus-ring mt-2 w-full rounded-xl border-2 border-forest/15 bg-cream px-4 py-3 text-forest outline-none"
            placeholder="admin@sunnyskitchen.in"
          />
        </label>
        <label className="block">
          <span className="font-display text-xs font-bold uppercase tracking-widest text-forest/70">
            Password
          </span>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="focus-ring mt-2 w-full rounded-xl border-2 border-forest/15 bg-cream px-4 py-3 text-forest outline-none"
            placeholder="••••••••"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="focus-ring w-full rounded-full bg-forest px-6 py-3 font-display text-sm font-bold text-cream transition hover:bg-tomato disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </main>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { getAdminToken } from "@/lib/admin-auth";
import {
  adminGetUsers,
  adminCreateUser,
  adminUpdateUser,
  adminDeleteUser,
  ApiError,
  type User,
  type UserRole,
} from "@/lib/api";

const ROLES: UserRole[] = ["admin", "manager", "staff"];

export default function AdminRolesPage() {
  const [token, setToken] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "staff" as UserRole,
  });

  const loadData = useCallback(async (authToken: string) => {
    setLoading(true);
    try {
      const data = await adminGetUsers(authToken);
      setUsers(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load users");
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

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setCreating(true);
    setError(null);
    try {
      const created = await adminCreateUser(token, newUser);
      setUsers((prev) => [...prev, created]);
      setNewUser({ name: "", email: "", password: "", role: "staff" });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create user");
    } finally {
      setCreating(false);
    }
  }

  async function updateRole(id: string, role: UserRole) {
    if (!token) return;
    try {
      const updated = await adminUpdateUser(token, id, { role });
      setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Update failed");
    }
  }

  async function deleteUser(id: string, name: string) {
    if (!token) return;
    if (!confirm(`Delete user ${name}?`)) return;
    try {
      await adminDeleteUser(token, id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Delete failed");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-script text-4xl text-forest">Role & Access</h2>
        <p className="mt-1 font-display text-sm font-semibold text-forest/60">
          Manage staff accounts and their roles.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border-2 border-tomato/40 bg-tomato/10 px-4 py-3 font-display text-sm font-semibold text-tomato">
          {error}
        </div>
      )}

      {/* Add New User Form */}
      <form
        onSubmit={handleCreateUser}
        className="rounded-2xl border-2 border-forest/15 bg-card p-5 shadow-sm max-w-4xl"
      >
        <p className="font-display text-sm font-bold text-forest mb-3">
          ➕ Add a new staff member
        </p>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          <input
            required
            placeholder="Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            className="focus-ring rounded-lg border-2 border-forest/15 bg-cream px-3 py-2 text-sm text-forest outline-none"
          />
          <input
            required
            type="email"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            className="focus-ring rounded-lg border-2 border-forest/15 bg-cream px-3 py-2 text-sm text-forest outline-none"
          />
          <input
            required
            type="password"
            placeholder="Password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            className="focus-ring rounded-lg border-2 border-forest/15 bg-cream px-3 py-2 text-sm text-forest outline-none"
          />
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
            className="focus-ring rounded-lg border-2 border-forest/15 bg-cream px-3 py-2 text-sm text-forest outline-none"
          >
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <button
          type="submit"
          disabled={creating}
          className="focus-ring mt-4 rounded-xl bg-forest px-6 py-2.5 font-display text-sm font-bold text-cream transition hover:bg-forestDark disabled:opacity-60"
        >
          {creating ? "Creating…" : "Create User"}
        </button>
      </form>

      {loading ? (
        <p className="font-display text-sm text-forest/60">Loading staff...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <div key={user._id} className="bg-card p-5 rounded-2xl border-2 border-forest/10 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div className="h-12 w-12 rounded-full bg-sun/50 flex items-center justify-center text-xl text-forest font-bold mb-3 border-2 border-forest/20">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <button
                    onClick={() => deleteUser(user._id, user.name)}
                    className="text-forest/40 hover:text-tomato p-1"
                    title="Delete user"
                  >
                    ✕
                  </button>
                </div>
                <h3 className="font-bold text-lg text-forest">{user.name}</h3>
                <p className="text-sm text-forest/60">{user.email}</p>
                {user.mobile && <p className="text-sm text-forest/60">{user.mobile}</p>}
                
                <div className="mt-4">
                  <label className="text-xs font-bold text-forest/50 uppercase tracking-wide block mb-1">Role</label>
                  <select
                    value={user.role}
                    onChange={(e) => updateRole(user._id, e.target.value as UserRole)}
                    className="focus-ring w-full rounded-lg border-2 border-forest/15 bg-cream/50 px-3 py-2 text-sm font-semibold text-forest outline-none cursor-pointer"
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

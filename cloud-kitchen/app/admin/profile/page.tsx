"use client";

import { useEffect, useState, useCallback } from "react";
import { getAdminToken } from "@/lib/admin-auth";
import { adminGetProfile, adminUpdateProfile, ApiError, type User } from "@/lib/api";

export default function AdminProfilePage() {
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
  });

  const loadData = useCallback(async (authToken: string) => {
    setLoading(true);
    try {
      const data = await adminGetProfile(authToken);
      setProfile(data);
      setFormData({
        name: data.name,
        email: data.email,
        mobile: data.mobile || "",
        password: "",
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load profile");
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setSuccess(null);
    
    const payload: Partial<User> & { password?: string } = {
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile,
    };
    if (formData.password) {
      payload.password = formData.password;
    }

    try {
      const updated = await adminUpdateProfile(token, payload);
      setProfile(updated);
      setFormData(prev => ({ ...prev, password: "" }));
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Update failed");
    }
  }

  if (loading) return <p className="font-display text-sm text-forest/60">Loading profile...</p>;
  if (!profile) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="font-script text-4xl text-forest">My Profile</h2>
        <p className="mt-1 font-display text-sm font-semibold text-forest/60">
          Update your account details and password.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border-2 border-tomato/40 bg-tomato/10 px-4 py-3 font-display text-sm font-semibold text-tomato">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border-2 border-forest/40 bg-forest/10 px-4 py-3 font-display text-sm font-semibold text-forest">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-card p-6 rounded-2xl border-2 border-forest/10 shadow-sm space-y-5">
        
        <div className="flex items-center gap-4 border-b-2 border-forest/10 pb-6 mb-6">
          <div className="h-20 w-20 rounded-full bg-sun flex items-center justify-center text-4xl text-forest font-bold">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-bold text-forest">{profile.name}</h3>
            <span className="uppercase text-xs tracking-wider font-bold bg-forest text-cream px-2 py-1 rounded">
              {profile.role}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-forest mb-1">Full Name</label>
          <input
            required
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full focus-ring rounded-lg border-2 border-forest/15 bg-cream px-3 py-2 text-forest outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-forest mb-1">Email Address</label>
          <input
            required
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full focus-ring rounded-lg border-2 border-forest/15 bg-cream px-3 py-2 text-forest outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-forest mb-1">Mobile Number</label>
          <input
            type="tel"
            value={formData.mobile}
            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
            className="w-full focus-ring rounded-lg border-2 border-forest/15 bg-cream px-3 py-2 text-forest outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-forest mb-1">New Password <span className="font-normal text-forest/50">(leave blank to keep current)</span></label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full focus-ring rounded-lg border-2 border-forest/15 bg-cream px-3 py-2 text-forest outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full focus-ring rounded-xl bg-forest px-6 py-3 font-display text-base font-bold text-cream transition hover:bg-forestDark"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}

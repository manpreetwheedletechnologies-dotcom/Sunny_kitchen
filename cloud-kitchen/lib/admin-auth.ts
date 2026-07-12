"use client";

const TOKEN_KEY = "sk-admin-token";
const ROLE_KEY = "sk-admin-role";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function getAdminRole(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ROLE_KEY);
}

export function setAdminRole(role: string) {
  window.localStorage.setItem(ROLE_KEY, role);
}

export function clearAdminToken() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(ROLE_KEY);
}

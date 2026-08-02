"use client";

/**
 * Mock auth for the v1 frontend build. Persists a lightweight user to
 * localStorage so the account area works end-to-end without a backend.
 * Swaps for Supabase Auth later — same {name, email} surface.
 */
export type User = { name: string; email: string };

const KEY = "abdmall:user";

export function getUser(): User | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function setUser(user: User) {
  try {
    localStorage.setItem(KEY, JSON.stringify(user));
  } catch {
    /* ignore */
  }
}

export function signOut() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { AuthUser, AccessStatus } from "@/types";

interface AuthCtx {
  token: string | null;
  user: AuthUser | null;
  access: AccessStatus | null;
  loading: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  token: null, user: null, access: null, loading: true,
  login: () => {}, logout: () => {}, refresh: async () => {},
});

const TOKEN_KEY = "trk_auth_token";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [access, setAccess] = useState<AccessStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch /auth/me + /payments/access using the current token
  const refresh = useCallback(async () => {
    const t = (typeof window !== "undefined") ? localStorage.getItem(TOKEN_KEY) : null;
    if (!t) {
      setToken(null); setUser(null); setAccess(null);
      setLoading(false);
      return;
    }
    try {
      const [meRes, accessRes] = await Promise.all([
        fetch(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${t}` } }),
        fetch(`${API_BASE}/payments/access`, { headers: { Authorization: `Bearer ${t}` } }),
      ]);
      if (meRes.ok) {
        const u = await meRes.json();
        setUser(u);
        setToken(t);
      } else {
        // Token invalid → clear
        localStorage.removeItem(TOKEN_KEY);
        setToken(null); setUser(null);
      }
      if (accessRes.ok) {
        setAccess(await accessRes.json());
      } else {
        setAccess(null);
      }
    } catch {
      // Network failure — keep token, mark unknown
      setToken(t);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  function login(newToken: string, newUser: AuthUser) {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(newUser);
    refresh();
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null); setUser(null); setAccess(null);
  }

  return (
    <Ctx.Provider value={{ token, user, access, loading, login, logout, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() { return useContext(Ctx); }

/** Helper to grab the current token outside of React render */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

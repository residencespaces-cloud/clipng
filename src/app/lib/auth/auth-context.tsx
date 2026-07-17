"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api, getTokens, setTokens } from "@/app/lib/api/client";

type AuthUser = { id: string; email: string; role: string; name: string };

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string, expectedRole?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!getTokens()) {
      setUser(null);
      return;
    }
    try {
      const me = await api.auth.me();
      setUser(me);
    } catch {
      setTokens(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const login = async (email: string, password: string, expectedRole?: string) => {
    const tokens = await api.auth.login({ email, password });
    setTokens(tokens);
    const me = await api.auth.me();
    if (expectedRole && me.role !== "admin" && me.role !== expectedRole) {
      setTokens(null);
      setUser(null);
      throw new Error(
        `This email is registered as a ${me.role}. Switch the role toggle and try again.`,
      );
    }
    setUser(me);
    const dest = me.role === "admin" ? "/admin" : me.role === "funder" ? "/funder" : "/clipper";
    router.push(dest);
  };

  const logout = async () => {
    await api.auth.logout().catch(() => undefined);
    setTokens(null);
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

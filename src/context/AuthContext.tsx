import React, { createContext, useEffect, useState } from "react";
import { loginApi, forgotPasswordApi, changeFirstPasswordApi, AuthUser } from "../services/auth.api";
import { setAuthToken } from "../services/apiClient";

type AuthCtx = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<{ ok: boolean; message?: string }>;
  changeFirstPassword: (username: string, newPassword: string) => Promise<{ ok: boolean; message?: string }>;
};

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem("movura_user");
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch { return null; }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("movura_token"));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAuthToken(token ?? undefined);
    if (token) localStorage.setItem("movura_token", token);
    else localStorage.removeItem("movura_token");
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("movura_user", JSON.stringify(user));
    else localStorage.removeItem("movura_user");
  }, [user]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const res = await loginApi(email, password);
    setLoading(false);
    if ((res as any).error) return { ok: false, error: (res as any).error };
    setUser((res as any).user ?? null);
    setToken((res as any).token ?? null);
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const forgotPassword = async (email: string) => {
    setLoading(true);
    const r = await forgotPasswordApi(email);
    setLoading(false);
    return { ok: !!r.success, message: r.message };
  };

  const changeFirstPassword = async (username: string, newPassword: string) => {
    setLoading(true);
    const r = await changeFirstPasswordApi(username, newPassword);
    setLoading(false);
    return { ok: !!r.success, message: r.message };
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, forgotPassword, changeFirstPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used inside AuthProvider");
  return ctx;
}

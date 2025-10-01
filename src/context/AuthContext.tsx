import React, { createContext, useCallback, useEffect, useState } from "react";
import { loginApi, forgotPasswordApi, changeFirstPasswordApi, AuthUser } from "../services/auth.api";
import { setAuthToken } from "../services/apiClient";

type LoginResponse = { token: string; user: AuthUser };

type AuthCtx = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  changeFirstPassword: (username: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
};

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Inicialmente en true

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("movura_token");
      if (storedToken) {
        setToken(storedToken);
        setAuthToken(storedToken);
        const storedUser = localStorage.getItem("movura_user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }
    } catch (error) {
      console.error("Fallo al cargar el estado de autenticación desde localStorage", error);
      // En caso de error, limpiar el estado
      setToken(null);
      setUser(null);
      localStorage.removeItem("movura_token");
      localStorage.removeItem("movura_user");
    } finally {
      setLoading(false); // Finaliza la carga inicial
    }
  }, []);

  const handleSetToken = (newToken: string | null) => {
    setToken(newToken);
    setAuthToken(newToken ?? undefined);
    if (newToken) {
      localStorage.setItem("movura_token", newToken);
    } else {
      localStorage.removeItem("movura_token");
    }
  };

  const handleSetUser = (newUser: AuthUser | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem("movura_user", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("movura_user");
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { token: apiToken, user: apiUser } = await loginApi(email, password);
      handleSetUser(apiUser);
      handleSetToken(apiToken);
    } catch (error) {
      handleSetUser(null);
      handleSetToken(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    handleSetUser(null);
    handleSetToken(null);
  }, []);

  const forgotPassword = async (email: string) => {
    setLoading(true);
    try {
      return await forgotPasswordApi(email);
    } finally {
      setLoading(false);
    }
  };

  const changeFirstPassword = async (username: string, newPassword: string) => {
    setLoading(true);
    try {
      return await changeFirstPasswordApi(username, newPassword);
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{ user, token, loading, isAuthenticated, login, logout, forgotPassword, changeFirstPassword }}
    >
      {!loading && children} {/* No renderizar hijos hasta que la carga inicial termine */}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return ctx;
}

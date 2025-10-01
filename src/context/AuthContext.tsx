import React, { createContext, useCallback, useEffect, useState } from "react";
import { loginApi, forgotPasswordApi, changeFirstPasswordApi, AuthUser } from "../services/auth.api";
import { setAuthToken } from "../services/apiClient";

// Definición del tipo para la respuesta de la API de login
type LoginResponse = { token: string; user: AuthUser };

// El contrato del contexto se ha simplificado. Las funciones ahora lanzan errores en lugar de devolver objetos de estado.
type AuthCtx = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean; // Estado derivado para conveniencia
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  changeFirstPassword: (username: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
};

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    // La inicialización desde localStorage es buena para persistir la sesión en desarrollo.
    try {
      const raw = localStorage.getItem("movura_user");
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => localStorage.getItem("movura_token"));
  const [loading, setLoading] = useState(false);

  // Efecto para sincronizar el token con el cliente API y localStorage.
  useEffect(() => {
    setAuthToken(token ?? undefined);
    if (token) {
      localStorage.setItem("movura_token", token);
    } else {
      localStorage.removeItem("movura_token");
    }
  }, [token]);

  // Efecto para persistir los datos del usuario.
  useEffect(() => {
    if (user) {
      localStorage.setItem("movura_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("movura_user");
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // La API ahora devuelve datos en caso de éxito o lanza un error en caso de fallo.
      const { token: apiToken, user: apiUser } = await loginApi(email, password);
      setUser(apiUser);
      setToken(apiToken);
    } catch (error) {
      // Limpiamos el estado en caso de error y relanzamos para que el componente pueda manejarlo.
      setUser(null);
      setToken(null);
      throw error;
    } finally {
      // Esto garantiza que el loading se desactive siempre.
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
  }, []);

  const forgotPassword = async (email: string) => {
    setLoading(true);
    try {
      return await forgotPasswordApi(email);
    } catch (error) {
      throw error; // Relanzamos para que la UI pueda mostrar una notificación
    } finally {
      setLoading(false);
    }
  };

  const changeFirstPassword = async (username: string, newPassword: string) => {
    setLoading(true);
    try {
      return await changeFirstPasswordApi(username, newPassword);
    } catch (error) {
      throw error; // Relanzamos para que la UI pueda mostrar una notificación
    } finally {
      setLoading(false);
    }
  };

  // Estado derivado: es más limpio que tener que verificar `!!token` en los componentes.
  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, login, logout, forgotPassword, changeFirstPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext debe usarse dentro de un AuthProvider");
  return ctx;
}

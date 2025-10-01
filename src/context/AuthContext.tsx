
import React, { createContext, useCallback, useState, useContext } from "react";

// El tipo de usuario ahora incluye la bandera 'firstLogin'
// como se ve en el archivo de referencia.
type AuthUser = {
  username: string;
  firstLogin: boolean;
};

type AuthCtx = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null; // <-- Añadido para gestionar errores
  login: (username: string, pass: string) => Promise<void>;
  logout: () => void;
  completeFirstLogin: () => void;
};

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // <-- 1. DECLARAR ESTADO DE ERROR

  const login = async (username: string, pass: string) => {
    setLoading(true);
    setError(null); // Limpiamos errores anteriores
    
    await new Promise(resolve => setTimeout(resolve, 600));

    if (username && pass) {
      // Éxito: creamos un usuario de prueba.
      setUser({ username: username, firstLogin: true });
      setLoading(false);
    } else {
      // Error: el usuario o la contraseña están vacíos.
      const errText = "Usuario o contraseña inválidos";
      setError(errText);
      setLoading(false);
      throw new Error(errText);
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    // No borramos el localStorage para este ejemplo, pero en una app real se haría.
  }, []);

  const completeFirstLogin = () => {
    if (user) {
      setUser({ ...user, firstLogin: false });
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated, error, login, logout, completeFirstLogin }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return ctx;
}

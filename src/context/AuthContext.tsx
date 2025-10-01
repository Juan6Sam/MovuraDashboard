
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Usuario, RespuestaLogin } from '../types';
import * as authApi from '../services/auth.api';

interface AuthContextType {
  usuario: Usuario | null;
  login: (credenciales: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Lógica para verificar si ya existe un token al cargar la app
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Aquí podrías decodificar el token para obtener los datos del usuario
      // y establecer el estado de autenticación. Por simplicidad, lo omitimos.
      // En una app real, llamarías a un endpoint como /api/auth/me
    }
    setIsLoading(false);
  }, []);

  const login = async (credenciales: { email: string; password: string }) => {
    const respuesta: RespuestaLogin = await authApi.login(credenciales);
    setUsuario(respuesta.usuario);
  };

  const logout = () => {
    authApi.logout();
    setUsuario(null);
  };

  const value = {
    usuario,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

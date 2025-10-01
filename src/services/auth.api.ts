
import apiClient from './apiClient';
import { RespuestaLogin, Usuario } from '../types';

// Endpoint: POST /api/auth/login
export const login = async (credenciales: { email: string; password: string }): Promise<RespuestaLogin> => {
  const response = await apiClient.post('/auth/login', credenciales);
  // Almacenar el token después de un login exitoso
  if (response.data.accessToken) {
    localStorage.setItem('accessToken', response.data.accessToken);
  }
  return response.data;
};

// Endpoint: POST /api/auth/forgot
export const forgotPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post('/auth/forgot', { email });
  return response.data;
};

// Endpoint: POST /api/auth/change-first-password
export const changeFirstPassword = async (datos: any): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post('/auth/change-first-password', datos);
  return response.data;
};

// Función para hacer logout
export const logout = () => {
  // Limpiar el token de localStorage
  localStorage.removeItem('accessToken');
  // Aquí se podría añadir una llamada a un endpoint de logout en el backend si existiera
};

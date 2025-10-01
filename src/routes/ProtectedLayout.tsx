
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedLayout: React.FC = () => {
  const { usuario, isLoading } = useAuth();

  if (isLoading) {
    // Muestra un spinner o similar mientras se verifica la autenticación
    return <div>Cargando...</div>;
  }

  if (!usuario) {
    // Si no hay usuario, redirige a la página de login
    return <Navigate to="/login" replace />;
  }

  // Si el usuario está autenticado, renderiza el contenido de la ruta protegida
  return <Outlet />;
};

export default ProtectedLayout;

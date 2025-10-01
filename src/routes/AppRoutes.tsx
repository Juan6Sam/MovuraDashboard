import React, { Suspense } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import ProtectedLayout from "./ProtectedLayout";

// --- Carga diferida (Lazy Loading) de componentes ---
const Login = React.lazy(() => import("../modules/auth/Login"));
const ForgotPassword = React.lazy(() => import("../modules/auth/ForgotPassword"));
const FirstPasswordChange = React.lazy(() => import("../modules/auth/FirstPasswordChange"));
const PasswordUpdated = React.lazy(() => import("../modules/auth/PasswordUpdated"));
const GestionDeTarifas = React.lazy(() => import("../modules/tarifas/GestionDeTarifas"));
const ComerciosAsociados = React.lazy(() => import("../modules/comercios/ComerciosAsociados"));
const ConsultaDeOcupacion = React.lazy(() => import("../modules/ocupacion/ConsultaDeOcupacion"));
const ConsultaDeTransacciones = React.lazy(() => import("../modules/transacciones/ConsultaDeTransacciones"));
const PagoManual = React.lazy(() => import("../modules/pagos/PagoManual"));

// --- Contenedor de Carga ---
// Un componente de carga estilizado para una mejor experiencia de usuario.
const Loading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%' }}>
    Cargando...
  </div>
);

// --- Enrutador de Rutas Públicas ---
// Si el usuario está autenticado, lo redirige al home. Si no, muestra la ruta pública.
const PublicRoutes = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
};

// --- Enrutador de Rutas Privadas ---
// Si el usuario no está autenticado, lo redirige al login. Si no, muestra la ruta protegida.
const PrivateRoutes = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? (
    <ProtectedLayout />
  ) : (
    <Navigate to="/login" replace />
  );
};

// --- Componente Principal de Rutas ---
// Utiliza una única instancia de <Routes> para gestionar toda la navegación.
export default function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Rutas Públicas */}
        <Route element={<PublicRoutes />}>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/change-password" element={<FirstPasswordChange />} />
          <Route path="/password-updated" element={<PasswordUpdated />} />
        </Route>

        {/* Rutas Privadas */}
        <Route element={<PrivateRoutes />}>
          <Route path="/" element={<GestionDeTarifas />} />
          <Route path="/tarifas" element={<GestionDeTarifas />} />
          <Route path="/comercios" element={<ComerciosAsociados />} />
          <Route path="/ocupacion" element={<ConsultaDeOcupacion />} />
          <Route path="/transacciones" element={<ConsultaDeTransacciones />} />
          <Route path="/pago-manual" element={<PagoManual />} />
        </Route>

        {/* Redirección por defecto */}
        {/* Si ninguna ruta coincide, redirige a /login. */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}

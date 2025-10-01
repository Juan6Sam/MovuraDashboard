import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../modules/auth/Login";
import ForgotPassword from "../modules/auth/ForgotPassword";
import FirstPasswordChange from "../modules/auth/FirstPasswordChange";
import PasswordUpdated from "../modules/auth/PasswordUpdated";
import GestionDeTarifas from "../modules/tarifas/GestionDeTarifas";
import ComerciosAsociados from "../modules/comercios/ComerciosAsociados";
import ConsultaDeOcupacion from "../modules/ocupacion/ConsultaDeOcupacion";
import ConsultaDeTransacciones from "../modules/transacciones/ConsultaDeTransacciones";
import PagoManual from "../modules/pagos/PagoManual";
import { useAuth } from "../hooks/useAuth";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/change-password" element={<FirstPasswordChange />} />
        <Route path="/password-updated" element={<PasswordUpdated />} />

        <Route path="/" element={<ProtectedRoute><GestionDeTarifas /></ProtectedRoute>} />
        <Route path="/tarifas" element={<ProtectedRoute><GestionDeTarifas /></ProtectedRoute>} />
        <Route path="/comercios" element={<ProtectedRoute><ComerciosAsociados /></ProtectedRoute>} />
        <Route path="/ocupacion" element={<ProtectedRoute><ConsultaDeOcupacion /></ProtectedRoute>} />
        <Route path="/transacciones" element={<ProtectedRoute><ConsultaDeTransacciones /></ProtectedRoute>} />
        <Route path="/pago-manual" element={<ProtectedRoute><PagoManual /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

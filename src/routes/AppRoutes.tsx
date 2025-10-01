import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

// Importamos todas las "vistas" que nuestra máquina de estados puede mostrar.
import Login from "../modules/auth/Login";
import ForgotPassword from "../modules/auth/ForgotPassword";
import FirstPasswordChange from "../modules/auth/FirstPasswordChange";
import PasswordUpdated from "../modules/auth/PasswordUpdated";
import ProtectedLayout from "./ProtectedLayout"; // Este es nuestro "AppShell"

// Un componente de carga simple para transiciones.
const Loading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%' }}>
    Cargando...
  </div>
);

// AppRoutes ahora es una máquina de estados que controla el flujo de la UI.
export default function AppRoutes() {
  const { user, isAuthenticated, loading: authLoading, completeFirstLogin } = useAuth();
  
  // 'phase' es el estado actual de nuestra máquina. Determina qué vista se muestra.
  const [phase, setPhase] = useState("login");

  // Este efecto reacciona a los cambios en el estado de autenticación
  // y actualiza la 'phase' para mostrar la vista correcta.
  useEffect(() => {
    if (authLoading) return; // No hacer nada mientras se carga el estado de auth

    if (isAuthenticated) {
      // Si el usuario está autenticado, decidimos a dónde debe ir.
      if (user?.firstLogin) {
        // Si es su primer login, forzamos el cambio de contraseña.
        setPhase("change");
      } else {
        // Si no, va a la aplicación principal.
        setPhase("app");
      }
    } else {
      // Si no está autenticado, lo mantenemos en las vistas públicas.
      // No cambiamos la fase si ya está en "forgot" para no interrumpir el flujo.
      if (phase !== "forgot") {
        setPhase("login");
      }
    }
  }, [isAuthenticated, user, authLoading]);

  // La lógica de renderizado ahora es un gran `switch` basado en la 'phase'.
  if (authLoading) {
    return <Loading />;
  }

  switch (phase) {
    case "login":
      // A la vista de Login le pasamos una función para que pueda cambiar la fase a "forgot".
      return <Login onForgot={() => setPhase("forgot")} />;

    case "forgot":
      // A la de ForgotPassword, una para volver a "login".
      return <ForgotPassword onBack={() => setPhase("login")} />;

    case "change":
      // A la de cambio de contraseña, el nombre de usuario y una función para cuando termine.
      return (
        <FirstPasswordChange
          username={user?.username ?? ""}
          onDone={() => setPhase("updated")}
        />
      );

    case "updated":
      // A la de contraseña actualizada, el nombre de usuario y una función para continuar.
      return (
        <PasswordUpdated
          username={user?.username ?? ""}
          onContinue={() => {
            // Aquí le decimos al AuthContext que el primer login se completó
            // y pasamos a la fase final: la aplicación.
            completeFirstLogin();
            setPhase("app");
          }}
        />
      );

    case "app":
      // Una vez en la app, mostramos el layout principal.
      return <ProtectedLayout />;

    default:
      // Como fallback, siempre volvemos al login.
      return <Login onForgot={() => setPhase("forgot")} />;
  }
}

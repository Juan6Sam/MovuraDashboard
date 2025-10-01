import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// Este componente actúa como un guardián para las rutas protegidas.
// También puede servir como un layout común (p. ej., con una barra de navegación y lateral)

export default function ProtectedLayout() {
  const { isAuthenticated, loading } = useAuth();

  // 1. Mientras se determina el estado de autenticación, no renderizar nada o un spinner.
  // Esto evita un parpadeo o redirección prematura antes de que el AuthContext se inicialice.
  if (loading) {
    return <div>Cargando...</div>; // O un componente Spinner global
  }

  // 2. Si no está autenticado, redirigir a la página de login.
  // `replace` evita que el usuario pueda volver a la página protegida con el botón de retroceso del navegador.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. Si está autenticado, renderizar la ruta hija correspondiente.
  // <Outlet /> es el marcador de posición donde react-router renderizará el componente de la ruta anidada.
  // Aquí podrías envolver el Outlet con un layout común (Navbar, Sidebar, etc.)
  return (
    <div>
      {/* Ejemplo: <Navbar /> */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}

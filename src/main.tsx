import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import "./index.css";le

// Crear una instancia única del cliente de React Query
const queryClient = new QueryClient();

// Inicializar MSW para mocks si está habilitado
async function enableMocking() {
  const useMock = (import.meta.env.VITE_USE_MOCK ?? "true").toString() !== "false";
  if (!useMock) {
    return;
  }

  const { worker } = await import("./mocks/browser");

  // `worker.start()` devuelve una Promise que se resuelve cuando el Service Worker está listo.
  return worker.start({
    // Silenciar advertencias sobre peticiones no manejadas por MSW
    onUnhandledRequest: "bypass",
  });
}

// Obtener el elemento raíz del DOM
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("No se encontró el elemento raíz con id 'root'");
}

const root = createRoot(rootElement);

// Iniciar los mocks y luego renderizar la aplicación
enableMocking().then(() => {
  root.render(
    <StrictMode>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </StrictMode>
  );
});

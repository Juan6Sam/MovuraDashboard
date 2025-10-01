import { api } from "./apiClient";

// La evaluación de VITE_USE_MOCK es correcta y robusta.
const USE_MOCK = (import.meta.env.VITE_USE_MOCK ?? "true").toString() !== "false";

export type AuthUser = { username: string; email?: string; firstLogin?: boolean };

export async function loginApi(email: string, password: string) {
  // La lógica del mock es adecuada para el desarrollo.
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    if (!email || !password) {
      // Para mantener consistencia con la API real, lanzamos un error.
      throw new Error("Usuario o contraseña inválidos");
    }
    const token = btoa(JSON.stringify({ sub: email, iat: Date.now() }));
    const firstLogin = email.includes("first");
    return { token, user: { username: email.split("@")[0], email, firstLogin } };
  }

  // Lógica para la API real
  try {
    const res = await api.post("/auth/login", { email, password });
    return res.data;
  } catch (err: any) {
    // Lanzamos el error para que sea capturado por react-query o el вызывающий código.
    throw new Error(err?.response?.data?.message || err.message || "Error en el login");
  }
}

export async function forgotPasswordApi(email: string) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    if (!email) throw new Error("El correo es requerido");
    return { success: true, message: "Si el correo existe, se envió una contraseña temporal." };
  }

  try {
    const res = await api.post("/auth/forgot", { email });
    return res.data;
  } catch (err: any) {
    throw new Error(err?.response?.data?.message || err.message || "Error al solicitar nueva contraseña");
  }
}

export async function changeFirstPasswordApi(username: string, newPassword: string) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    if (!username || !newPassword) throw new Error("Datos inválidos");
    return { success: true };
  }

  try {
    const res = await api.post("/auth/change-first-password", { username, newPassword });
    return res.data;
  } catch (err: any) {
    throw new Error(err?.response?.data?.message || err.message || "Error al cambiar la contraseña");
  }
}
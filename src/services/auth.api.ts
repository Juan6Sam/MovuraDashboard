import { api } from "./apiClient";

const USE_MOCK = (import.meta.env.VITE_USE_MOCK ?? "true").toString() !== "false";

export type AuthUser = { username: string; email?: string; firstLogin?: boolean };

export async function loginApi(email: string, password: string) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    if (!email || !password) return { error: "Usuario o contraseña inválidos" };
    const token = btoa(JSON.stringify({ sub: email, iat: Date.now() }));
    const firstLogin = email.includes("first");
    return { token, user: { username: email.split("@")[0], email, firstLogin } };
  }
  try {
    const res = await api.post("/auth/login", { email, password });
    return res.data;
  } catch (err: any) {
    return { error: err?.response?.data?.message || err.message };
  }
}

export async function forgotPasswordApi(email: string) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return { success: true, message: "Si el correo existe, se envió una contraseña temporal." };
  }
  const res = await api.post("/auth/forgot", { email });
  return res.data;
}

export async function changeFirstPasswordApi(username: string, newPassword: string) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return { success: true };
  }
  const res = await api.post("/auth/change-first-password", { username, newPassword });
  return res.data;
}

import React, { useState } from "react";
import Card from "../../components/ui/Card";
import TextInput from "../../components/ui/TextInput";
import { PrimaryButton, GhostButton } from "../../components/ui/Button";
import { Mail, Lock, LogIn } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (e: any) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const res = await login(email.trim(), pass);
    setLoading(false);
    if (!res.ok) { setError(res.error || "Error"); return; }
    const userRaw = localStorage.getItem("movura_user");
    const user = userRaw ? JSON.parse(userRaw) : null;
    if (user?.firstLogin) nav("/change-password"); else nav("/");
  };

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <Card className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <div className="font-semibold text-xl">Movura Admin</div>
          <div className="text-xs text-gray-500">Acceso administrador</div>
        </div>

        <form onSubmit={handle} className="space-y-4">
          <TextInput label="Correo" value={email} onChange={setEmail} placeholder="admin@empresa.com" leftIcon={<Mail className="h-4 w-4 text-gray-400" />} />
          <TextInput label="Contraseña" value={pass} onChange={setPass} type="password" placeholder="********" leftIcon={<Lock className="h-4 w-4 text-gray-400" />} />
          {error && <div className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</div>}
          <div className="flex items-center justify-between">
            <GhostButton onClick={() => nav("/forgot")}>¿Olvidaste tu contraseña?</GhostButton>
            <PrimaryButton type="submit" disabled={!email || !pass || loading}><LogIn className="h-4 w-4" /> {loading ? "Entrando..." : "Entrar"}</PrimaryButton>
          </div>
        </form>
      </Card>
    </div>
  );
}

import React, { useState } from "react";
import Card from "../../components/ui/Card";
import TextInput from "../../components/ui/TextInput";
import { PrimaryButton, GhostButton } from "../../components/ui/Button";
import { Mail, Lock, LogIn } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// El componente ahora recibe 'onForgot' como prop para cambiar de vista.
export default function Login({ onForgot }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Llamamos a la función de login del contexto, que ahora es local.
      await login(email, pass);
      // Ya no es necesario navegar. El componente AppRoutes se encargará
      // de mostrar la siguiente vista cuando el estado de autenticación cambie.
    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-4 bg-gray-50">
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
            {/* El botón de "olvidaste tu contraseña" ahora llama a la función onForgot */}
            <GhostButton type="button" onClick={onForgot}>¿Olvidaste tu contraseña?</GhostButton>
            <PrimaryButton type="submit" disabled={!email || !pass || loading}><LogIn className="h-4 w-4" /> {loading ? "Entrando..." : "Entrar"}</PrimaryButton>
          </div>
        </form>
      </Card>
    </div>
  );
}

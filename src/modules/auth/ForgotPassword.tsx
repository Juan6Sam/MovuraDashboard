import React, { useState } from "react";
import Card from "../../components/ui/Card";
import TextInput from "../../components/ui/TextInput";
import { PrimaryButton, GhostButton } from "../../components/ui/Button";
import { Mail } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = async (e: any) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const r = await forgotPassword(email.trim());
    setLoading(false);
    setSent(r.ok);
  };

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <Card className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <div className="font-semibold text-xl">Recuperar acceso</div>
        </div>

        {!sent ? (
          <form onSubmit={handle} className="space-y-4">
            <TextInput label="Correo" value={email} onChange={setEmail} placeholder="admin@empresa.com" leftIcon={<Mail className="h-4 w-4 text-gray-400" />} />
            <div className="flex items-center justify-between">
              <GhostButton onClick={() => nav("/login")}>Volver</GhostButton>
              <PrimaryButton type="submit" disabled={!email || loading}><Mail className="h-4 w-4" /> Enviar contraseña temporal</PrimaryButton>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">Listo. Si el correo existe, se envió una contraseña temporal.</div>
            <PrimaryButton onClick={() => nav("/login")}>Volver al login</PrimaryButton>
          </div>
        )}
      </Card>
    </div>
  );
}

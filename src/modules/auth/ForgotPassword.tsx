
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import TextInput from "../../components/ui/TextInput";
import { PrimaryButton, GhostButton } from "../../components/ui/Button";
import { Mail } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen grid place-items-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <div className="font-semibold text-xl">Movura Admin</div>
          <div className="text-xs text-gray-500">Recuperar acceso</div>
        </div>

        {!sent ? (
          <form onSubmit={handleSend} className="space-y-4">
            <p className="text-sm text-gray-600">Ingresa tu correo y te enviaremos una contraseña temporal para que puedas volver a acceder.</p>
            <TextInput label="Correo" type="email" value={email} onChange={setEmail} placeholder="admin@empresa.com" autoComplete="email" leftIcon={<Mail className="h-4 w-4 text-gray-400" />} required />
            <div className="flex items-center justify-between">
              <Link to="/login">
                <GhostButton type="button">Volver</GhostButton>
              </Link>
              <PrimaryButton type="submit" disabled={!email || loading}>
                {loading ? "Enviando..." : "Enviar contraseña temporal"}
              </PrimaryButton>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
              <p className="font-medium">¡Listo!</p>
              <p className="mt-1">Si el correo <strong>{email}</strong> está registrado, recibirás una contraseña temporal en tu bandeja de entrada.</p>
            </div>
            <Link to="/login" className="w-full">
              <PrimaryButton className="w-full">Volver al login</PrimaryButton>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}

import React, { useState } from "react";
import Card from "../../components/ui/Card";
import TextInput from "../../components/ui/TextInput";
import { PrimaryButton } from "../../components/ui/Button";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function FirstPasswordChange() {
  const { user, changeFirstPassword } = useAuth();
  const nav = useNavigate();
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (e: any) => {
    e.preventDefault();
    setErr("");
    if (p1.length < 8) return setErr("La nueva contraseña debe tener al menos 8 caracteres");
    if (p1 !== p2) return setErr("Las contraseñas no coinciden");
    setLoading(true);
    const r = await changeFirstPassword(user?.username ?? "", p1);
    setLoading(false);
    if (r.ok) nav("/password-updated"); else setErr(r.message || "Error");
  };

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <Card className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <div className="font-semibold text-lg">Primer ingreso - Cambio de contraseña</div>
        </div>
        <div className="mb-2 text-sm text-gray-600">Hola <span className="font-medium">{user?.username}</span>, establece una nueva contraseña.</div>

        <form onSubmit={handle} className="space-y-4">
          <TextInput label="Nueva contraseña" type="password" value={p1} onChange={setP1} placeholder="********" />
          <TextInput label="Confirmar contraseña" type="password" value={p2} onChange={setP2} placeholder="********" />
          {err && <div className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{err}</div>}
          <div className="flex items-center justify-end">
            <PrimaryButton type="submit" disabled={p1.length < 8 || p1 !== p2 || loading}>{loading ? "Guardando..." : "Guardar y continuar"}</PrimaryButton>
          </div>
        </form>
      </Card>
    </div>
  );
}

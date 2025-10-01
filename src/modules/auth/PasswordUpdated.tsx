import React from "react";
import Card from "../../components/ui/Card";
import { PrimaryButton } from "../../components/ui/Button";
import { CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PasswordUpdated() {
  const nav = useNavigate();
  return (
    <div className="min-h-screen grid place-items-center p-4">
      <Card className="w-full max-w-md text-center">
        <div className="flex justify-center mb-4"><CheckCircle2 className="h-12 w-12 text-emerald-600" /></div>
        <div className="text-xl font-semibold mb-1">Contraseña actualizada</div>
        <div className="text-sm text-gray-600">Tu contraseña se cambió correctamente.</div>
        <div className="mt-6"><PrimaryButton onClick={() => nav("/")}>Ir al Home</PrimaryButton></div>
      </Card>
    </div>
  );
}

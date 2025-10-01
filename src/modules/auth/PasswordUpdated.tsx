import React from "react";
import Card from "../../components/ui/Card";
import { PrimaryButton } from "../../components/ui/Button";
import { CheckCircle2 } from "lucide-react";

// El componente ahora recibe 'username' y la función 'onContinue' como props.
export default function PasswordUpdated({ username, onContinue }) {
  return (
    <div className="min-h-screen grid place-items-center p-4 bg-gray-50">
      <Card className="w-full max-w-md text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="h-12 w-12 text-emerald-600" />
        </div>
        <div className="text-xl font-semibold mb-1">Contraseña actualizada</div>
        <p className="text-sm text-gray-600">
          Tu contraseña se cambió correctamente, <span className="font-medium">{username || "usuario"}</span>.
        </p>
        <div className="mt-6 flex justify-center">
          {/* El botón ahora llama a onContinue para señalar el final del flujo */}
          <PrimaryButton onClick={onContinue}>Ir al Home</PrimaryButton>
        </div>
      </Card>
    </div>
  );
}

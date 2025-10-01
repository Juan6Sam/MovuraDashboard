import React, { useState } from "react";
import Card from "../../components/ui/Card";
import TextInput from "../../components/ui/TextInput";
import { PrimaryButton } from "../../components/ui/Button";
import { KeyRound } from "lucide-react";

// El componente ahora recibe 'username' y la función 'onDone' como props.
export default function FirstPasswordChange({ username, onDone }) {
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Lógica de validación, como en el archivo de referencia.
  const lenOk = p1.length >= 8;
  const matchOk = p2.length > 0 && p1 === p2;
  const canSubmit = lenOk && matchOk;

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!canSubmit) {
      if (p1.length < 8) return setError("La nueva contraseña debe tener al menos 8 caracteres");
      if (p1 !== p2) return setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    // Simulamos el guardado con un retardo.
    await new Promise(resolve => setTimeout(resolve, 300));
    setLoading(false);
    
    // Llamamos a la función 'onDone' para que AppRoutes sepa que hemos terminado.
    onDone();
  };

  return (
    <div className="min-h-screen grid place-items-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <div className="font-semibold text-xl">Movura Admin</div>
          <div className="text-xs text-gray-500">Primer ingreso - Cambio de contraseña</div>
        </div>
        <div className="mb-4 text-sm text-gray-600">
          Hola <span className="font-medium">{username}</span>, por seguridad necesitas establecer una nueva contraseña.
        </div>
        <form onSubmit={handle} className="space-y-4">
          <TextInput 
            label="Nueva contraseña" 
            type="password" 
            value={p1} 
            onChange={setP1} 
            placeholder="Mínimo 8 caracteres" 
          />
          <TextInput 
            label="Confirmar contraseña" 
            type="password" 
            value={p2} 
            onChange={setP2} 
            placeholder="Repite la contraseña"
          />
          {error && <div className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</div>}
          <div className="flex items-center justify-end">
            <PrimaryButton type="submit" disabled={!canSubmit || loading}>
              <KeyRound className="h-4 w-4" /> 
              {loading ? "Guardando..." : "Guardar y continuar"}
            </PrimaryButton>
          </div>
        </form>
      </Card>
    </div>
  );
}

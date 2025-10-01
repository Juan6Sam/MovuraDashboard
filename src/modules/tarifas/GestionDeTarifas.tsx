import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, CreditCard, Save, RotateCcw, Building2, User, Mail, MapPin, CalendarClock } from "lucide-react";
import toast from "react-hot-toast";

import { getParkings, getParkingById, updateParkingConfig, Parking } from "../../services/parkings.api";
import { useForm } from "../../hooks/useForm";

import Card from "../../components/ui/Card";
import TextInput from "../../components/ui/TextInput";
import { PrimaryButton, GhostButton } from "../../components/ui/Button";
import { InfoChip, InfoLine } from "../../components/Info";

// --- Configuración Inicial y de Validación para el Formulario ---
const initialFormState = {
  tarifaBase: "",
  costoHora: "",
  fraccionMin: 15,
  costoFraccion: "",
  graciaMin: 5,
  horaCorte: "23:59",
};

const validator = (form: typeof initialFormState) => ({
  tarifaBase: form.tarifaBase !== "" && !isNaN(Number(form.tarifaBase)) && Number(form.tarifaBase) >= 0,
  costoHora: form.costoHora !== "" && !isNaN(Number(form.costoHora)) && Number(form.costoHora) >= 0,
  fraccionMin: Number(form.fraccionMin) > 0,
  costoFraccion: form.costoFraccion !== "" && !isNaN(Number(form.costoFraccion)) && Number(form.costoFraccion) >= 0,
  graciaMin: Number(form.graciaMin) >= 0,
  horaCorte: /^\d{2}:\d{2}$/.test(form.horaCorte || ""),
});

// --- Componente Principal ---
export default function GestionDeTarifasModule() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDirty, setDirty] = useState(false);
  const queryClient = useQueryClient();

  // 1. Hook para obtener la lista de todos los estacionamientos (cacheado)
  const { data: parkingList = [], isLoading: listLoading } = useQuery({ 
    queryKey: ["parkings"], 
    queryFn: getParkings 
  });

  // 2. Hook para obtener los detalles del estacionamiento seleccionado
  const { data: selectedParking, isLoading: detailLoading } = useQuery({
    queryKey: ["parkings", selectedId],
    queryFn: () => getParkingById(selectedId!),
    enabled: !!selectedId, // Solo ejecutar si hay un ID seleccionado
  });

  // 3. Hook para manejar el estado y la validación del formulario
  const { form, setForm, update, v } = useForm(initialFormState, validator);
  const allValid = Object.values(v).every(Boolean);

  // 4. Hook de mutación para guardar los cambios en la configuración
  const { mutate: saveChanges, isLoading: isSaving } = useMutation(
    (newConfig: typeof initialFormState) => updateParkingConfig(selectedId!, newConfig),
    {
      onSuccess: (updatedParking) => {
        toast.success("Tarifas guardadas correctamente");
        // Invalidar y refetchear los datos del parking para obtener la info más reciente
        queryClient.invalidateQueries(["parkings", selectedId]);
        queryClient.setQueryData(["parkings", selectedId], updatedParking);
        setDirty(false);
      },
      onError: (error: any) => {
        toast.error(error.message || "No se pudo guardar la configuración");
      },
    }
  );

  // Efecto para inicializar el ID seleccionado con el primer parking de la lista
  useEffect(() => {
    if (!selectedId && parkingList.length > 0) {
      setSelectedId(parkingList[0].id);
    }
  }, [parkingList, selectedId]);

  // Efecto para actualizar el formulario cuando cambia el parking seleccionado
  useEffect(() => {
    if (selectedParking?.config) {
      setForm(selectedParking.config);
      setDirty(false); // Resetear dirty state al cambiar de parking
    } else {
      setForm(initialFormState); // Limpiar si no hay config
    }
  }, [selectedParking, setForm]);

  const handleUpdate = (field: keyof typeof initialFormState, value: any) => {
    update(field, value);
    setDirty(true);
  };

  const handleReset = () => {
    if (selectedParking?.config) {
      setForm(selectedParking.config);
    }
    setDirty(false);
  };

  const handleSave = () => {
    if (!allValid || !selectedId) return;
    saveChanges(form);
  };

  const isLoading = listLoading || detailLoading;

  if (isLoading && !selectedParking) {
    return <div className="p-6 text-center text-gray-500">Cargando datos...</div>;
  }

  return (
    <div className="flex h-full w-full flex-col bg-gray-50 dark:bg-neutral-950">
      <Header selectedId={selectedId} setSelectedId={setSelectedId} parkingList={parkingList} selectedParking={selectedParking} />
      
      <div className="mx-auto w-full max-w-7xl p-4">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div className="text-lg font-semibold">Gestión de Tarifas</div>
            <div className="flex items-center gap-2">
              <GhostButton onClick={handleReset} disabled={!isDirty || isSaving}><RotateCcw className="h-4 w-4" /> Restablecer</GhostButton>
              <PrimaryButton onClick={handleSave} disabled={!isDirty || !allValid || isSaving}>
                {isSaving ? "Guardando..." : <><Save className="h-4 w-4" /> Guardar</>}
              </PrimaryButton>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <TextInput label="Tarifa por día (MXN)" type="number" value={form.tarifaBase} onChange={(e) => handleUpdate("tarifaBase", e.target.value)} status={v.tarifaBase?"success":"error"} help="Requerido. No negativo." />
            <TextInput label="Costo x hora (MXN)" type="number" value={form.costoHora} onChange={(e) => handleUpdate("costoHora", e.target.value)} status={v.costoHora?"success":"error"} help="Requerido. No negativo." />
            <SelectInput label="Tiempo de fracciones (min)" value={String(form.fraccionMin)} onChange={(e) => handleUpdate("fraccionMin", Number(e.target.value))} options={[5,10,15,20,30,60]} />
            <TextInput label="Costo de cada fracción (MXN)" type="number" value={form.costoFraccion} onChange={(e) => handleUpdate("costoFraccion", e.target.value)} status={v.costoFraccion?"success":"error"} help="Requerido. No negativo." />
            <SelectInput label="Tiempo de gracia (min)" value={String(form.graciaMin)} onChange={(e) => handleUpdate("graciaMin", Number(e.target.value))} options={[0,3,5,10,15,20,30]} />
            <TextInput label="Hora de corte" type="time" value={form.horaCorte} onChange={(e) => handleUpdate("horaCorte", e.target.value)} status={v.horaCorte?"success":"error"} help="Formato HH:MM" />
          </div>
        </Card>
      </div>
    </div>
  );
}

// --- Sub-componentes para Limpieza ---

function Header({ selectedId, setSelectedId, parkingList, selectedParking }: { selectedId: string | null; setSelectedId: (id: string) => void; parkingList: Parking[]; selectedParking: Parking | null | undefined; }) {
  return (
    <div className="border-b border-gray-200 bg-white/70 backdrop-blur px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950/70">
      <div className="mx-auto max-w-7xl">
        <SelectInput label="Selecciona estacionamiento" value={selectedId ?? ""} onChange={(e) => setSelectedId(e.target.value)} options={parkingList.map(p => ({ label: p.nombre, value: p.id }))} />
        <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
          <InfoChip icon={<Building2 className="h-4 w-4" />} title="Grupo" value={selectedParking?.grupo} />
          <InfoChip icon={<User className="h-4 w-4" />} title="Administrador" value={selectedParking?.adminNombre} />
          <InfoChip icon={<Mail className="h-4 w-4" />} title="Correo" value={selectedParking?.adminCorreo} />
        </div>
        <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
          <InfoLine icon={<MapPin className="h-4 w-4" />} title="Nombre" value={selectedParking?.nombre} />
          <InfoLine icon={<MapPin className="h-4 w-4" />} title="Dirección" value={selectedParking?.direccion} />
          <InfoLine icon={<CalendarClock className="h-4 w-4" />} title="Alta" value={formatDateTime(selectedParking?.altaISO)} />
          <InfoLine icon={<CreditCard className="h-4 w-4" />} title="Estatus" value={selectedParking?.estatus} highlight={selectedParking?.estatus === "Activo" ? "emerald" : "red"} />
        </div>
      </div>
    </div>
  );
}

function SelectInput({ label, value, onChange, options }: { label:string, value: string | number, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: (string | number | { label: string, value: string | number })[] }) {
  return (
    <label className="block">
      <span className="text-sm text-gray-600 dark:text-gray-300">{label}</span>
      <select className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-sky-500 dark:border-gray-700 dark:bg-neutral-900" value={value} onChange={onChange}>
        {options.map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const lbl = typeof opt === 'object' ? opt.label : opt;
          return <option key={val} value={val}>{lbl}</option>
        })}
      </select>
    </label>
  )
}

function formatDateTime(iso?: string) {
  try {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: "2-digit", minute: "2-digit" });
  } catch { return iso || "-"; }
}

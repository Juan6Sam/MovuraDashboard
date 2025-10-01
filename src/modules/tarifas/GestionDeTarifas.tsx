import React, { useMemo, useState } from "react";
import { Clock, CreditCard, Save, RotateCcw, Building2, Mail, User, MapPin, CalendarClock } from "lucide-react";

// Módulo de Gestión de Tarifas, basado en Archivosreferencia/02 Gestion de Tarifas.txt

function cn(...classes) { return classes.filter(Boolean).join(" "); }

// --- Componentes de UI internos (para replicar el diseño de referencia) ---

function Card({ children, className }) {
  return (
    <div className={cn("rounded-2xl border border-gray-200 bg-white p-6 shadow-sm", className)}>
      {children}
    </div>
  );
}

function Label({ children }) {
  return <span className="text-sm text-gray-600">{children}</span>;
}

function TextInput({ label, type = "text", value, onChange, placeholder, leftIcon, min, step, help, status }) {
  return (
    <label className="block">
      {label && <Label>{label}</Label>}
      <div className={cn(
        "mt-1 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm focus-within:border-sky-500",
        status === "error" && "border-red-400 bg-red-50",
        status === "success" && "border-emerald-400 bg-emerald-50"
      )}>
        {leftIcon}
        <input
          className="w-full bg-transparent outline-none placeholder:text-gray-400"
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          step={step}
        />
      </div>
      {help && <div className={cn("mt-1 text-xs", status === "error" ? "text-red-600" : "text-emerald-600")}>{help}</div>}
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      {label && <Label>{label}</Label>}
      <select
        className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-sky-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

function PrimaryButton({ children, className, ...props }) {
  return (
    <button
      aria-disabled={props.disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium shadow-sm",
        "bg-sky-600 text-white hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400",
        props.disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, className, ...props }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium",
        "hover:bg-gray-100",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function InfoChip({ icon, title, value }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm">
      <div className="text-gray-500">{icon}</div>
      <div className="truncate"><span className="text-gray-500">{title}:</span> <span className="font-medium">{value || "-"}</span></div>
    </div>
  );
}

function InfoLine({ icon, title, value, highlight }) {
  const badge = highlight === "emerald" ? "bg-emerald-50 text-emerald-700" : highlight === "red" ? "bg-red-50 text-red-700" : "";
  return (
    <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm">
      <div className="text-gray-500">{icon}</div>
      <div className="truncate">
        <span className="text-gray-500">{title}:</span>{" "}
        {highlight ? (
          <span className={cn("ml-1 rounded-md px-2 py-0.5 text-xs font-medium", badge)}>{value || "-"}</span>
        ) : (
          <span className="font-medium">{value || "-"}</span>
        )}
      </div>
    </div>
  );
}

// --- Datos de ejemplo (extraídos del archivo de referencia) ---
const PARKINGS = [
  {
    id: "p1",
    nombre: "Parking Centro",
    direccion: "Av. Principal 123, Col. Centro, CDMX",
    grupo: "Gpo. Alfa",
    adminNombre: "Laura Perez",
    adminCorreo: "laura.perez@parking.mx",
    altaISO: "2025-08-10T09:42:00",
    estatus: "Activo",
    config: { tarifaBase: 25, costoHora: 35, fraccionMin: 15, costoFraccion: 10, graciaMin: 5, horaCorte: "23:59" },
  },
  {
    id: "p2",
    nombre: "Plaza Norte",
    direccion: "Calz. Valle 456, Col. Norte, Monterrey",
    grupo: "Gpo. Beta",
    adminNombre: "Carlos Diaz",
    adminCorreo: "carlos.diaz@parking.mx",
    altaISO: "2025-07-03T14:10:00",
    estatus: "Activo",
    config: { tarifaBase: 20, costoHora: 30, fraccionMin: 10, costoFraccion: 8, graciaMin: 3, horaCorte: "00:00" },
  },
  {
    id: "p3",
    nombre: "Estacionamiento Sur",
    direccion: "Av. del Parque 789, Puebla",
    grupo: "Gpo. Gamma",
    adminNombre: "Martha Lopez",
    adminCorreo: "martha.lopez@parking.mx",
    altaISO: "2025-04-18T08:00:00",
    estatus: "Cancelado",
    config: { tarifaBase: 18, costoHora: 26, fraccionMin: 30, costoFraccion: 7, graciaMin: 10, horaCorte: "06:00" },
  },
];

function formatDateTime(iso) {
  try {
    const d = new Date(iso);
    const date = d.toLocaleDateString();
    const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return `${date} ${time}`;
  } catch { return iso; }
}

// --- Componente Principal del Módulo ---
export default function GestionDeTarifas() {
  const [selectedId, setSelectedId] = useState(PARKINGS[0].id);
  const selected = useMemo(() => PARKINGS.find(p => p.id === selectedId), [selectedId]);
  const [form, setForm] = useState(selected ? { ...selected.config } : {});
  const [dirty, setDirty] = useState(false);

  React.useEffect(() => {
    if (selected) { setForm({ ...selected.config }); setDirty(false); }
  }, [selectedId, selected]);

  const v = {
    tarifaBase: form.tarifaBase !== "" && !isNaN(Number(form.tarifaBase)) && Number(form.tarifaBase) >= 0,
    costoHora: form.costoHora !== "" && !isNaN(Number(form.costoHora)) && Number(form.costoHora) >= 0,
    fraccionMin: form.fraccionMin !== "" && Number(form.fraccionMin) > 0,
    costoFraccion: form.costoFraccion !== "" && !isNaN(Number(form.costoFraccion)) && Number(form.costoFraccion) >= 0,
    graciaMin: form.graciaMin !== "" && Number(form.graciaMin) >= 0,
    horaCorte: /^\d{2}:\d{2}$/.test(form.horaCorte || ""),
  };
  const allValid = Object.values(v).every(Boolean);

  const update = (key, val) => { setForm((f) => ({ ...f, [key]: val })); setDirty(true); };
  const reset = () => { if(selected) { setForm({ ...selected.config }); setDirty(false); } };
  const save = () => {
    if (!allValid || !selected) return;
    const parkingIndex = PARKINGS.findIndex(p => p.id === selected.id);
    if (parkingIndex !== -1) {
        // Esta es una simulación. En una app real, aquí llamarías a una API.
        PARKINGS[parkingIndex].config = { ...form };
        setDirty(false);
        alert("Tarifas guardadas correctamente para " + selected.nombre);
    }
  };

  if (!selected) return <div>Cargando...</div>;

  return (
    <div className="flex h-full w-full flex-col bg-gray-50">
      <div className="border-b border-gray-200 bg-white/70 backdrop-blur px-4 py-3">
        <div className="mx-auto max-w-7xl">
          <Select
            label="Selecciona estacionamiento"
            value={selectedId}
            onChange={setSelectedId}
            options={PARKINGS.map(p => ({ value: p.id, label: p.nombre }))}
          />
          <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
            <InfoChip icon={<Building2 className="h-4 w-4" />} title="Grupo" value={selected.grupo} />
            <InfoChip icon={<User className="h-4 w-4" />} title="Admin" value={selected.adminNombre} />
            <InfoChip icon={<Mail className="h-4 w-4" />} title="Correo" value={selected.adminCorreo} />
          </div>
        </div>
      </div>
      
      <div className="mx-auto w-full max-w-7xl p-4">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div className="text-lg font-semibold">Configuración de Tarifas</div>
            <div className="flex items-center gap-2">
              <GhostButton onClick={reset} disabled={!dirty}><RotateCcw className="h-4 w-4" /> Restablecer</GhostButton>
              <PrimaryButton onClick={save} disabled={!dirty || !allValid}><Save className="h-4 w-4" /> Guardar</PrimaryButton>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <TextInput label="Tarifa por día (MXN)" type="number" value={form.tarifaBase} onChange={(v) => update("tarifaBase", v)} status={v.tarifaBase ? "success" : "error"} help={v.tarifaBase ? "OK" : "Requerido, >= 0"} />
            <TextInput label="Costo x hora (MXN)" type="number" value={form.costoHora} onChange={(v) => update("costoHora", v)} status={v.costoHora ? "success" : "error"} help={v.costoHora ? "OK" : "Requerido, >= 0"} />
            <Select label="Fracciones (min)" value={String(form.fraccionMin)} onChange={(val) => update("fraccionMin", Number(val))} options={[5,10,15,20,30,60].map(n => ({ value: String(n), label: `${n} min` }))} />
            <TextInput label="Costo Fracción (MXN)" type="number" value={form.costoFraccion} onChange={(v) => update("costoFraccion", v)} status={v.costoFraccion ? "success" : "error"} help={v.costoFraccion ? "OK" : "Requerido, >= 0"} />
            <Select label="Gracia (min)" value={String(form.graciaMin)} onChange={(val) => update("graciaMin", Number(val))} options={[0,3,5,10,15,20,30].map(n => ({ value: String(n), label: `${n} min` }))} />
            <TextInput label="Hora de corte" type="time" value={form.horaCorte} onChange={(v) => update("horaCorte", v)} status={v.horaCorte ? "success" : "error"} help={v.horaCorte ? "OK" : "Formato HH:MM"} />
          </div>
        </Card>
      </div>
    </div>
  );
}

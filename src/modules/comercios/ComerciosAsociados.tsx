import React, { useMemo, useState } from "react";
import { Building2, Mail, User, MapPin, CalendarClock, CreditCard, ChevronRight, Plus, Save, X, Pencil, Trash2, RotateCcw, Check, Bell } from "lucide-react";

// Módulo de Comercios Asociados, basado en Archivosreferencia/03 Comercios asociados.txt

function cn(...classes) { return classes.filter(Boolean).join(" "); }

// --- Componentes de UI internos ---

function Card({ children, className }) {
  return <div className={cn("rounded-2xl border border-gray-200 bg-white p-6 shadow-sm", className)}>{children}</div>;
}

function Label({ children }) {
  return <span className="text-sm text-gray-600">{children}</span>;
}

function TextInput({ label, value, onChange, placeholder, autoFocus }) {
  return (
    <label className="block">
      {label && <Label>{label}</Label>}
      <div className="mt-1 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm focus-within:border-sky-500">
        <input
          className="w-full bg-transparent outline-none placeholder:text-gray-400"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
        />
      </div>
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
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

function PrimaryButton({ children, className, ...props }) {
    return <button {...props} className={cn("inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium shadow-sm bg-sky-600 text-white hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400", props.disabled && "opacity-50 cursor-not-allowed", className)}>{children}</button>;
}

function GhostButton({ children, className, ...props }) {
    return <button {...props} className={cn("inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium hover:bg-gray-100", className)}>{children}</button>;
}

function Badge({ children, color = "gray" }) {
  const styles = { gray: "bg-gray-100 text-gray-700", emerald: "bg-emerald-50 text-emerald-700", red: "bg-red-50 text-red-700" };
  return <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium", styles[color])}>{children}</span>;
}

function Modal({ open, onClose, children, title }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl rounded-2xl border bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-lg font-semibold">{title}</div>
          <button onClick={onClose} className="rounded-xl p-2 hover:bg-gray-100"><X className="h-5 w-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// --- Datos de ejemplo ---
const PARKINGS = [
  {
    id: "p1",
    nombre: "Parking Centro",
    grupo: "Gpo. Alfa",
    adminNombre: "Laura Perez",
    adminCorreo: "laura.perez@parking.mx",
    comercios: [
      { id: "c1", nombre: "Café Central", tipo: "monto", valor: 50, usuarios: ["cortesias@cafecentral.mx"], estatus: "Activo" },
      { id: "c2", nombre: "Librería Athenas", tipo: "tiempo", valor: 30, usuarios: ["promo@athenas.mx","gerencia@athenas.mx"], estatus: "Activo" },
    ],
  },
  {
    id: "p2",
    nombre: "Plaza Norte",
    grupo: "Gpo. Beta",
    adminNombre: "Carlos Diaz",
    adminCorreo: "carlos.diaz@parking.mx",
    comercios: [
      { id: "c3", nombre: "Cineplex", tipo: "tiempo", valor: 60, usuarios: ["taquilla@cineplex.mx"], estatus: "Cancelado" },
    ],
  },
];

function isEmail(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s||"").trim()); }

// --- Componente Principal del Módulo ---
export default function ComerciosAsociados() {
  const [selectedId, setSelectedId] = useState(PARKINGS[0].id);
  const parking = useMemo(() => PARKINGS.find(p => p.id === selectedId), [selectedId]);
  const [rows, setRows] = useState(parking?.comercios || []);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  React.useEffect(() => { setRows(parking?.comercios || []); }, [selectedId]);

  const openCreate = () => { setEditing({ id: `tmp-${Date.now()}`, nombre: "", tipo: "monto", valor: "", usuarios: [], estatus: "Activo" }); setOpen(true); };
  const openEdit = (c) => { setEditing({ ...c, valor: String(c.valor) }); setOpen(true); };
  const closeModal = () => { setOpen(false); setEditing(null); };

  const saveEdit = () => {
    const valOk = !isNaN(Number(editing.valor)) && Number(editing.valor) > 0;
    if (!editing.nombre.trim() || !valOk || editing.usuarios.length === 0 || !editing.usuarios.every(isEmail)) return;

    let next = [...rows];
    const idx = next.findIndex(r => r.id === editing.id);
    const normalized = { ...editing, valor: Number(editing.valor) };

    if (idx >= 0) next[idx] = normalized; else next.push({ ...normalized, id: `c${Date.now()}` });
    setRows(next);
    closeModal();
  };

  const toggleStatus = (id) => {
    setRows(rows.map(r => r.id === id ? { ...r, estatus: r.estatus === "Activo" ? "Cancelado" : "Activo" } : r));
  };

  return (
    <div className="flex h-full w-full flex-col bg-gray-50">
      <div className="border-b bg-white/70 backdrop-blur px-4 py-3">
        <div className="mx-auto max-w-7xl">
          <Select
            label="Selecciona estacionamiento"
            value={selectedId}
            onChange={setSelectedId}
            options={PARKINGS.map(p => ({ value: p.id, label: p.nombre }))}
          />
          <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
            <InfoChip icon={<Building2 className="h-4 w-4" />} title="Grupo" value={parking?.grupo} />
            <InfoChip icon={<User className="h-4 w-4" />} title="Admin" value={parking?.adminNombre} />
            <InfoChip icon={<Mail className="h-4 w-4" />} title="Correo" value={parking?.adminCorreo} />
          </div>
        </div>
      </div>
      
      <div className="mx-auto w-full max-w-7xl p-4">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div className="text-lg font-semibold">Comercios asociados</div>
            <GhostButton onClick={openCreate}><Plus className="h-4 w-4" /> Nuevo comercio</GhostButton>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b text-gray-500"><th className="py-2 pr-3">Comercio</th><th className="py-2 pr-3">Usuarios</th><th className="py-2 pr-3">Tipo</th><th className="py-2 pr-3">Valor</th><th className="py-2 pr-3">Estatus</th><th className="py-2 pr-3 text-right">Acciones</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="py-2 pr-3 font-medium">{r.nombre}</td>
                    <td className="py-2 pr-3">{r.usuarios.length} cuenta(s)</td>
                    <td className="py-2 pr-3">{r.tipo === "monto" ? "Monto" : "Tiempo"}</td>
                    <td className="py-2 pr-3">{r.tipo === "monto" ? `$${r.valor}` : `${r.valor} min`}</td>
                    <td className="py-2 pr-3"><Badge color={r.estatus === "Activo" ? "emerald" : "red"}>{r.estatus}</Badge></td>
                    <td className="py-2 pr-3"><div className="flex items-center justify-end gap-2"><GhostButton onClick={() => openEdit(r)}><Pencil size={16}/>Editar</GhostButton><GhostButton onClick={() => toggleStatus(r.id)}>{r.estatus === "Activo" ? <Trash2 size={16}/> : <RotateCcw size={16}/>}{r.estatus === "Activo" ? "Baja" : "Reactivar"}</GhostButton></div></td>
                  </tr>
                ))}
                 {rows.length === 0 && (<tr><td colSpan={6} className="py-6 text-center text-gray-500">No hay comercios registrados.</td></tr>)}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Modal open={open} onClose={closeModal} title={editing?.id?.startsWith("tmp-") ? "Nuevo comercio" : "Editar comercio"}>
        {editing && (
          <div className="space-y-4">
            <TextInput label="Nombre del comercio" value={editing.nombre} onChange={v => setEditing({...editing, nombre: v})} placeholder="Ej. Café Central" autoFocus />
            <Select label="Tipo de cortesía" value={editing.tipo} onChange={v => setEditing({...editing, tipo: v})} options={[{value:"monto", label:"Monto (MXN)"},{value:"tiempo",label:"Tiempo (min)"}]}/>
            <TextInput label={`Valor (${editing.tipo === 'monto' ? 'MXN' : 'min'})`} type="number" value={editing.valor} onChange={v => setEditing({...editing, valor: v})} placeholder="0"/>
            <AccountsEditor value={editing.usuarios} onChange={list => setEditing({...editing, usuarios: list})}/>
            <div className="flex items-center justify-end gap-2 pt-2"><GhostButton onClick={closeModal}><X size={16}/>Cancelar</GhostButton><PrimaryButton onClick={saveEdit}><Save size={16}/>Guardar</PrimaryButton></div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function InfoChip({ icon, title, value }) {
    return <div className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm shadow-sm"><div className="text-gray-500">{icon}</div><div className="truncate"><span className="text-gray-500">{title}:</span> <span className="font-medium">{value || "-"}</span></div></div>;
}

function AccountsEditor({ value, onChange }) {
  const [email, setEmail] = useState("");
  const add = () => { if (isEmail(email)) { onChange([...(value||[]), email]); setEmail(""); } };
  const remove = (idx) => { onChange(value.filter((_, i) => i !== idx)); };

  return (
    <div>
      <Label>Correos de usuarios (con acceso a dar cortesías)</Label>
      <div className="mt-1 flex items-center gap-2">
        <TextInput value={email} onChange={setEmail} placeholder="usuario@comercio.mx" />
        <PrimaryButton type="button" onClick={add} disabled={!isEmail(email)}><Check size={16}/>Agregar</PrimaryButton>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {(value||[]).map((e, i) => (
          <span key={i} className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs shadow-sm"><Mail size={12}/>{e}<button onClick={() => remove(i)} className="p-1 rounded-full hover:bg-gray-100"><X size={12}/></button></span>
        ))}
      </div>
    </div>
  );
}

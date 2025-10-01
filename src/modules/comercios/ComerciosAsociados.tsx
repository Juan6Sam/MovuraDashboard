// src/modules/comercios/ComerciosAsociados.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { getParkings, getParkingById, updateComercios, Comercio } from "../../services/parkings.api";
import Card from "../../components/ui/Card";
import TextInput from "../../components/ui/TextInput";
import { PrimaryButton, GhostButton } from "../../components/ui/Button";
import { Plus, Save, X, Pencil, Trash2, RotateCcw, Mail } from "lucide-react";

// UI helpers (you can import shared ones if you put them in components/ui)
function Badge({ children, color = "gray" }: any) {
  const styles: Record<string,string> = {
    gray: "bg-gray-100 text-gray-700",
    emerald: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
  };
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs ${styles[color]}`}>{children}</span>;
}

export default function ComerciosAsociados() {
  const qc = useQueryClient();

  // PARKINGS list
  const parkingsQ = useQuery(["parkings"], getParkings);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (parkingsQ.data && parkingsQ.data.length && !selectedId) setSelectedId(parkingsQ.data[0].id);
  }, [parkingsQ.data]);

  // Parking details (has comercios)
  const parkingQ = useQuery(["parking", selectedId], () => selectedId ? getParkingById(selectedId) : Promise.resolve(null), { enabled: !!selectedId });

  const [rows, setRows] = useState<Comercio[]>([]);
  useEffect(() => {
    if (parkingQ.data?.comercios) setRows(parkingQ.data.comercios as Comercio[]);
    else setRows([]);
  }, [parkingQ.data]);

  // modal/editing state
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Comercio> | null>(null);
  const [notify, setNotify] = useState<string | null>(null);

  // mutation to save comercios (replace whole array)
  const saveMutation = useMutation((payload: { parkingId: string; comercios: Comercio[] }) => updateComercios(payload.parkingId, payload.comercios), {
    onSuccess: (data) => {
      qc.invalidateQueries(["parking", selectedId]);
      setNotify("Correos enviados a las cuentas añadidas");
    },
  });

  const openCreate = () => { setEditing({ id: `tmp-${Date.now()}`, nombre: "", tipo: "monto", valor: 0, usuarios: [], estatus: "Activo" }); setOpen(true); };
  const openEdit = (c: Comercio) => { setEditing({ ...c, valor: String(c.valor) as any }); setOpen(true); };
  const closeModal = () => { setOpen(false); setEditing(null); };

  const canSaveLocal = (e: any) => {
    if (!e) return false;
    if (!e.nombre || e.nombre.trim().length === 0) return false;
    const val = Number(e.valor);
    if (isNaN(val) || val <= 0) return false;
    if (!e.usuarios || e.usuarios.length === 0) return false;
    if (!e.usuarios.every((em: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(em)))) return false;
    return true;
  };

  const saveEdit = () => {
    if (!selectedId || !editing) return;
    if (!canSaveLocal(editing)) return alert("Datos inválidos");
    // build next array
    const next = [...rows];
    const idx = next.findIndex(r => r.id === editing.id);
    const normalized = { ...editing, valor: Number(editing.valor) } as Comercio;
    if (idx >= 0) next[idx] = normalized; else next.push({ ...normalized, id: `c${Date.now()}` });
    // call API (replace comercios)
    saveMutation.mutate({ parkingId: selectedId, comercios: next });
    setOpen(false);
  };

  const toggleStatus = (id: string) => {
    const next = rows.map(r => r.id === id ? { ...r, estatus: r.estatus === "Activo" ? "Cancelado" : "Activo" } : r);
    setRows(next);
    // optionally auto-save or require explicit save
  };

  const remove = (id: string) => {
    const next = rows.filter(r => r.id !== id);
    setRows(next);
  };

  return (
    <div className="flex h-full w-full flex-col bg-gray-50 dark:bg-neutral-950">
      <div className="border-b border-gray-200 bg-white/70 px-4 py-3">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label>
              <span className="text-sm text-gray-600">Selecciona estacionamiento</span>
              <select className="mt-1 w-full rounded-xl border px-3 py-2" value={selectedId ?? ""} onChange={(e)=>setSelectedId(e.target.value)}>
                {parkingsQ.data?.map((p:any)=> <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </label>

            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-500">Grupo</div>
              <div className="font-medium">{parkingQ.data?.grupo}</div>
            </div>

            <div className="flex items-center gap-2 justify-end">
              <PrimaryButton onClick={openCreate}><Plus className="h-4 w-4" /> Nuevo comercio</PrimaryButton>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-4">
        {notify && <div className="mb-4 rounded-xl bg-emerald-50 p-3 text-emerald-800">{notify}</div>}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div className="text-lg font-semibold">Comercios asociados</div>
            <div className="flex items-center gap-2">
              <GhostButton onClick={()=>{ qc.invalidateQueries(["parking", selectedId]); }}>{RotateCcw className="h-4 w-4"}</GhostButton>
              <PrimaryButton onClick={()=> saveMutation.mutate({ parkingId: selectedId!, comercios: rows })} disabled={!rows || rows.length===0}><Save className="h-4 w-4"/> Guardar cambios</PrimaryButton>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="py-2 pr-3">Comercio</th>
                  <th className="py-2 pr-3">Usuarios</th>
                  <th className="py-2 pr-3">Tipo</th>
                  <th className="py-2 pr-3">Valor</th>
                  <th className="py-2 pr-3">Estatus</th>
                  <th className="py-2 pr-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="py-2 pr-3 font-medium">{r.nombre}</td>
                    <td className="py-2 pr-3">{(r.usuarios||[]).length} cuenta(s)</td>
                    <td className="py-2 pr-3">{r.tipo === "monto" ? "Monto (MXN)" : "Tiempo (min)"}</td>
                    <td className="py-2 pr-3">{r.valor}</td>
                    <td className="py-2 pr-3">{r.estatus === "Activo" ? <Badge color="emerald">Activo</Badge> : <Badge color="red">Cancelado</Badge>}</td>
                    <td className="py-2 pr-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={()=> openEdit(r)} className="rounded-xl px-3 py-1 hover:bg-gray-100"><Pencil className="h-4 w-4" /> Editar</button>
                        <button onClick={()=> toggleStatus(r.id)} className="rounded-xl px-3 py-1 hover:bg-gray-100">{r.estatus === "Activo" ? <Trash2 className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}{r.estatus === "Activo" ? " Baja" : " Reactivar"}</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-gray-500">No hay comercios registrados</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Modal: simple inline modal (keep minimal) */}
      {open && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={closeModal} />
          <div className="relative z-10 w-full max-w-2xl rounded-2xl border bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-lg font-semibold">{String(editing.id).startsWith("tmp-") ? "Nuevo comercio" : "Editar comercio"}</div>
              <button onClick={closeModal} className="rounded-xl p-2"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-4">
              <TextInput label="Nombre del comercio" value={editing.nombre || ""} onChange={(v:any)=> setEditing({...editing, nombre: v})} placeholder="Ej. Café Central" />
              <label className="block">
                <span className="text-sm text-gray-600">Tipo de cortesía</span>
                <select className="mt-1 w-full rounded-xl border px-3 py-2" value={editing.tipo} onChange={(e)=> setEditing({...editing, tipo: e.target.value})}>
                  <option value="monto">Monto (MXN)</option>
                  <option value="tiempo">Tiempo (min)</option>
                </select>
              </label>
              <TextInput label={editing.tipo === "monto" ? "Monto de cortesía (MXN)" : "Tiempo de cortesía (min)"} type="number" value={String(editing.valor || "")} onChange={(v:any)=> setEditing({...editing, valor: v})} />
              <AccountsEditor value={editing.usuarios || []} onChange={(list:any)=> setEditing({...editing, usuarios: list})} />

              <div className="flex items-center justify-end gap-2 pt-2">
                <GhostButton onClick={closeModal}><X className="h-4 w-4" /> Cancelar</GhostButton>
                <PrimaryButton onClick={saveEdit} disabled={!canSaveLocal(editing)}><Save className="h-4 w-4" /> Guardar</PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Small accounts editor used in modal */
function AccountsEditor({ value, onChange }: any) {
  const [email, setEmail] = useState("");
  const add = () => { if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { onChange([...(value||[]), email]); setEmail(""); } };
  const remove = (i:number) => { const next = [...(value||[])]; next.splice(i,1); onChange(next); };
  return (
    <div>
      <div className="text-sm text-gray-600">Correos de usuarios (con acceso a dar cortesías)</div>
      <div className="mt-2 flex items-center gap-2">
        <input className="rounded-xl border px-3 py-2 w-full" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="usuario@comercio.mx" />
        <PrimaryButton onClick={add} disabled={!email}>Agregar</PrimaryButton>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {(value||[]).map((e:any,i:number)=> (
          <span key={`${e}-${i}`} className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs">
            {e}<button onClick={()=>remove(i)} className="p-1">x</button>
          </span>
        ))}
      </div>
    </div>
  );
}

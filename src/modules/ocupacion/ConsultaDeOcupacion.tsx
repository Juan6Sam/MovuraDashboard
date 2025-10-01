// src/modules/transacciones/ConsultaDeTransacciones.tsx
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getParkings, getTransactionsReport } from "../../services/parkings.api";
import Card from "../../components/ui/Card";
import TextInput from "../../components/ui/TextInput";
import { PrimaryButton } from "../../components/ui/Button";
import { CalendarRange, Download } from "lucide-react";
import * as XLSX from "xlsx";

export default function ConsultaDeTransacciones() {
  const parkingsQ = useQuery(["parkings"], getParkings);
  const [selectedId, setSelectedId] = useState<string | null>(parkingsQ.data?.[0]?.id ?? null);

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth()+1).padStart(2,"0");
  const dd = String(now.getDate()).padStart(2,"0");
  const defStart = `${yyyy}-${mm}-${dd}T08:00`;
  const defEnd = `${yyyy}-${mm}-${dd}T20:00`;

  const [start, setStart] = useState(defStart);
  const [end, setEnd] = useState(defEnd);

  const [params, setParams] = useState<{parkingId:string;start:string;end:string} | null>(null);
  const txQ = useQuery(["transactions", params?.parkingId, params?.start, params?.end], () => getTransactionsReport(params!.parkingId, new Date(params!.start).toISOString(), new Date(params!.end).toISOString()), { enabled: !!params });

  const consult = () => { if (!selectedId) return; if (!start || !end || new Date(start) > new Date(end)) return; setParams({ parkingId: selectedId, start, end }); };

  const totals = txQ.data ? { qty: txQ.data.length, sum: txQ.data.reduce((acc:any,r:any)=> acc + Number(r.total || 0), 0) } : { qty:0, sum:0 };

  const exportXLSX = () => {
    if (!txQ.data) return;
    const header = [["Parking", selectedId], ["Inicio", start], ["Fin", end]];
    const wsH = XLSX.utils.aoa_to_sheet(header);
    const data = txQ.data.map((r:any)=> ({ Correo: r.email, Entrada: r.entradaISO, Salida: r.salidaISO, Tiempo: r.minutes, Estatus: r.status, Monto: r.monto, Excedente: r.excedente, Total: r.total }));
    const wsD = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsH, "Reporte");
    XLSX.utils.book_append_sheet(wb, wsD, "Transacciones");
    XLSX.writeFile(wb, `reporte_transacciones_${selectedId}.xlsx`);
  };

  return (
    <div className="flex h-full w-full flex-col bg-gray-50">
      <div className="border-b p-4">
        <div className="mx-auto max-w-7xl grid md:grid-cols-3 gap-3">
          <label>
            <span className="text-sm text-gray-600">Selecciona estacionamiento</span>
            <select className="mt-1 rounded-xl border px-3 py-2" value={selectedId ?? ""} onChange={(e)=>setSelectedId(e.target.value)}>
              {parkingsQ.data?.map(p=> <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </label>

          <TextInput label="Fecha y hora inicial" type="datetime-local" value={start} onChange={setStart} leftIcon={<CalendarRange className="h-4 w-4"/>} />
          <TextInput label="Fecha y hora final" type="datetime-local" value={end} onChange={setEnd} leftIcon={<CalendarRange className="h-4 w-4"/>} />
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="text-lg font-semibold">Consulta de transacciones</div>
            <div className="flex gap-2">
              <PrimaryButton onClick={consult} disabled={!selectedId}>Consultar</PrimaryButton>
              <PrimaryButton onClick={exportXLSX} disabled={!txQ.data}><Download className="h-4 w-4"/> Exportar XLSX</PrimaryButton>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card><div className="text-sm text-gray-500">Cantidad de tickets</div><div className="mt-1 text-2xl font-semibold">{totals.qty}</div></Card>
            <Card><div className="text-sm text-gray-500">Monto total</div><div className="mt-1 text-2xl font-semibold">{new Intl.NumberFormat(undefined,{style:"currency",currency:"MXN"}).format(totals.sum)}</div></Card>
          </div>

          {txQ.data && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead><tr className="border-b text-gray-500"><th>Correo</th><th>Entrada</th><th>Salida</th><th>Tiempo</th><th>Estatus</th><th>Monto</th><th>Excedente</th><th>Total</th></tr></thead>
                <tbody>
                  {txQ.data.map((r:any)=> (
                    <tr key={r.id} className="border-b"><td className="py-2 pr-3">{r.email}</td><td>{r.entradaISO}</td><td>{r.salidaISO}</td><td>{r.minutes}</td><td>{r.status}</td><td>{r.monto}</td><td>{r.excedente}</td><td>{r.total}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

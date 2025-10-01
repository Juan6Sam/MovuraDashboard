// src/modules/pagos/PagoManual.tsx
import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getParkings, getManualSearch, markTicketPaid } from "../../services/parkings.api";
import Card from "../../components/ui/Card";
import TextInput from "../../components/ui/TextInput";
import { PrimaryButton } from "../../components/ui/Button";
import { CalendarRange, Printer, Search } from "lucide-react";
import QRCode from "qrcode";

export default function PagoManual() {
  const parkingsQ = useQuery(["parkings"], getParkings);
  const [selectedId, setSelectedId] = useState<string | null>(parkingsQ.data?.[0]?.id ?? null);

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth()+1).padStart(2,"0");
  const dd = String(now.getDate()).padStart(2,"0");
  const defStart = `${yyyy}-${mm}-${dd}T00:00`;
  const [start, setStart] = useState(defStart);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [params, setParams] = useState<{parkingId:string;start:string;email?:string;phone?:string} | null>(null);
  const searchQ = useQuery(["manualSearch", params?.parkingId, params?.start, params?.email, params?.phone], () => getManualSearch(params!.parkingId, new Date(params!.start).toISOString(), params!.email, params!.phone), { enabled: !!params });

  const [marked, setMarked] = useState<Record<string,boolean>>({});
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrFor, setQrFor] = useState<string | null>(null);

  const consult = () => {
    if (!selectedId) return;
    if (!start || (!email && !phone)) return;
    setParams({ parkingId: selectedId, start, email: email || undefined, phone: phone || undefined });
    setQrDataUrl(null);
    setQrFor(null);
    setMarked({});
  };

  const markPaid = async (ticket:any) => {
    try {
      const res:any = await markTicketPaid(ticket.id.split("-")[0] || selectedId!, ticket.id, undefined);
      if (res?.success && res.qrToken) {
        // generate QR from token (backend ideally returns a signed token or full URL)
        const token = res.qrToken;
        const text = `MOVURA|EXIT|${token}`;
        const url = await QRCode.toDataURL(text, { margin:1, scale:6 });
        setQrDataUrl(url);
        setQrFor(ticket.id);
        setMarked(m => ({ ...m, [ticket.id]: true }));
      } else {
        alert("Error marcando como pagado");
      }
    } catch (e:any) {
      console.error(e);
      alert("Error en la operación");
    }
  };

  const printQR = () => {
    if (!qrDataUrl) return;
    const w = window.open("");
    if (!w) return;
    w.document.write(`<html><head><title>QR de salida</title></head><body style="display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">`);
    w.document.write(`<img src="${qrDataUrl}" alt="QR de salida" />`);
    w.document.write(`</body></html>`);
    w.document.close();
    w.focus();
    w.print();
  };

  return (
    <div className="flex h-full w-full flex-col bg-gray-50">
      <div className="border-b p-4">
        <div className="mx-auto max-w-7xl grid md:grid-cols-4 gap-3">
          <label>
            <span className="text-sm text-gray-600">Selecciona estacionamiento</span>
            <select className="mt-1 rounded-xl border px-3 py-2" value={selectedId ?? ""} onChange={(e)=>setSelectedId(e.target.value)}>
              {parkingsQ.data?.map(p=> <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </label>
          <TextInput label="Fecha y hora inicial" type="datetime-local" value={start} onChange={setStart} leftIcon={<CalendarRange className="h-4 w-4" />} />
          <TextInput label="Correo del usuario" type="email" value={email} onChange={setEmail} leftIcon={null} />
          <TextInput label="Teléfono del usuario" type="tel" value={phone} onChange={setPhone} leftIcon={null} />
          <div className="flex items-end">
            <PrimaryButton onClick={consult} disabled={!start || (!email && !phone)}><Search className="h-4 w-4" /> Buscar</PrimaryButton>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-4">
        <Card>
          <div className="text-lg font-semibold mb-4">Resultados</div>
          {searchQ.isLoading && <div>Cargando...</div>}
          {searchQ.data && searchQ.data.length === 0 && <div>No se encontraron tickets</div>}
          {searchQ.data && searchQ.data.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead><tr className="border-b text-gray-500"><th>Correo</th><th>Teléfono</th><th>Entrada</th><th>Estatus</th><th>Monto estimado</th><th className="text-right">Acciones</th></tr></thead>
                  <tbody>
                    {searchQ.data.map((r:any)=> {
                      const minutes = Math.max(0, Math.round((Date.now() - new Date(r.entradaISO).getTime())/60000));
                      const ratePerHour = 30;
                      const est = Number(((minutes/60)*ratePerHour).toFixed(2));
                      const isPaid = !!marked[r.id];
                      return (
                        <tr key={r.id} className="border-b">
                          <td className="py-2 pr-3">{r.email}</td>
                          <td className="py-2 pr-3">{r.phone || "-"}</td>
                          <td className="py-2 pr-3">{r.entradaISO}</td>
                          <td className="py-2 pr-3">{isPaid ? "pagado-manual" : r.status}</td>
                          <td className="py-2 pr-3">{new Intl.NumberFormat(undefined,{style:"currency",currency:"MXN"}).format(est)}</td>
                          <td className="py-2 pr-3">
                            <div className="flex items-center justify-end gap-2">
                              {!isPaid ? <PrimaryButton onClick={()=>markPaid(r)}><Search className="h-4 w-4"/> Marcar “Pagado Manual”</PrimaryButton>
                              : <PrimaryButton onClick={printQR}><Printer className="h-4 w-4"/> Imprimir QR</PrimaryButton>}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {qrDataUrl && qrFor && (
                <div className="mt-6 text-center">
                  <div className="text-sm text-gray-600">QR generado para ticket:</div>
                  <div className="text-xs break-all">{qrFor}</div>
                  <img src={qrDataUrl} alt="QR de salida" className="mx-auto h-44 w-44" />
                  <div className="mt-3"><PrimaryButton onClick={printQR}><Printer className="h-4 w-4" /> Imprimir QR</PrimaryButton></div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

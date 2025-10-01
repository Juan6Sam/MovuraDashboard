// src/modules/pagos/PagoManual.tsx
import React, { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getParkings, getManualSearch, markTicketPaid, Parking, Ticket } from "../../services/parkings.api";
import Card from "../../components/ui/Card";
import TextInput from "../../components/ui/TextInput";
import { PrimaryButton } from "../../components/ui/Button";
import { CalendarRange, Printer, Search } from "lucide-react";
import QRCode from "qrcode";
import { useForm } from "../../hooks/useForm";

const searchValidator = (form: { start: string; email: string; phone: string }) => ({
  start: !!form.start,
  user: !!form.email || !!form.phone,
});

const getStartOfDay = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T00:00`;
};

export default function PagoManual() {
  const parkingsQ = useQuery<Parking[], Error>({ queryKey: ['parkings'], queryFn: getParkings });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { form, update, v } = useForm({ start: getStartOfDay(), email: '', phone: '' }, searchValidator);
  const [params, setParams] = useState<{ parkingId: string; start: string; email?: string; phone?: string } | null>(null);
  const [marked, setMarked] = useState<Record<string, boolean>>({});
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrFor, setQrFor] = useState<string | null>(null);

  const searchQ = useQuery<Ticket[], Error>({
    queryKey: ['manualSearch', params],
    queryFn: () => getManualSearch(params!.parkingId, new Date(params!.start).toISOString(), params!.email, params!.phone),
    enabled: !!params,
  });

  const markPaidMutation = useMutation<any, Error, { ticket: Ticket; amount: number }>({
    mutationFn: ({ ticket, amount }) => markTicketPaid(selectedId!, ticket.id, amount),
    onSuccess: (data, variables) => {
      if (data?.success && data.qrToken) {
        generateQR(data.qrToken, variables.ticket.id);
        setMarked((m) => ({ ...m, [variables.ticket.id]: true }));
      } else {
        alert('Error marcando como pagado: No se recibió token QR.');
      }
    },
    onError: (error) => {
      alert(`Error en la operación: ${error.message}`);
    },
  });

  React.useEffect(() => {
    if (parkingsQ.data && parkingsQ.data.length > 0 && !selectedId) {
      setSelectedId(parkingsQ.data[0].id);
    }
  }, [parkingsQ.data, selectedId]);

  const consult = () => {
    if (!selectedId || !v.start || !v.user) return;
    setParams({ parkingId: selectedId, ...form });
    setQrDataUrl(null);
    setQrFor(null);
    setMarked({});
  };

  const generateQR = async (token: string, ticketId: string) => {
    try {
      const text = `MOVURA|EXIT|${token}`;
      const url = await QRCode.toDataURL(text, { margin: 1, scale: 6 });
      setQrDataUrl(url);
      setQrFor(ticketId);
    } catch (error) {
      console.error('Error generando QR:', error);
      alert('Error al generar el código QR.');
    }
  };

  const printQR = () => {
    if (!qrDataUrl) return;
    const w = window.open('');
    if (!w) return;
    w.document.write(`<html><head><title>QR de salida</title></head><body style="display:flex;align-items:center;justify-content:center;height:100vh;margin:0;"><img src="${qrDataUrl}" alt="QR de salida" /></body></html>`);
    w.document.close();
    w.focus();
    w.print();
  };

  const selectedParking = useMemo(() => {
    return parkingsQ.data?.find((p) => p.id === selectedId);
  }, [selectedId, parkingsQ.data]);

  return (
    <div className="flex h-full w-full flex-col bg-gray-50">
      <div className="border-b p-4">
        <div className="mx-auto max-w-7xl grid md:grid-cols-4 gap-3">
          <label>
            <span className="text-sm text-gray-600">Selecciona estacionamiento</span>
            <select
              className="mt-1 rounded-xl border px-3 py-2"
              value={selectedId ?? ''}
              onChange={(e) => setSelectedId(e.target.value)}
              disabled={parkingsQ.isLoading}
            >
              {parkingsQ.isLoading ? <option>Cargando...</option> : parkingsQ.data?.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </label>
          <TextInput label="Fecha y hora inicial" type="datetime-local" value={form.start} onChange={(val) => update('start', val)} leftIcon={<CalendarRange className="h-4 w-4" />} />
          <TextInput label="Correo del usuario" type="email" value={form.email} onChange={(val) => update('email', val)} />
          <TextInput label="Teléfono del usuario" type="tel" value={form.phone} onChange={(val) => update('phone', val)} />
          <div className="flex items-end">
            <PrimaryButton onClick={consult} disabled={!v.start || !v.user || searchQ.isFetching}>
              <Search className="h-4 w-4" /> Buscar
            </PrimaryButton>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-4 w-full">
        <Card>
          <div className="text-lg font-semibold mb-4">Resultados</div>
          {searchQ.isLoading && <div>Cargando...</div>}
          {searchQ.isError && <div className="text-red-500">Error en la búsqueda: {searchQ.error.message}</div>}
          {searchQ.data && searchQ.data.length === 0 && <div>No se encontraron tickets</div>}
          {searchQ.data && searchQ.data.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b text-gray-500">
                      <th>Correo</th>
                      <th>Teléfono</th>
                      <th>Entrada</th>
                      <th>Estatus</th>
                      <th>Monto estimado</th>
                      <th className="text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchQ.data.map((r) => {
                      const minutes = Math.max(0, Math.round((Date.now() - new Date(r.entradaISO).getTime()) / 60000));
                      const ratePerHour = selectedParking?.config?.costoHora;
                      const est = ratePerHour != null ? Number(((minutes / 60) * ratePerHour).toFixed(2)) : null;
                      const isPaid = !!marked[r.id];

                      return (
                        <tr key={r.id} className="border-b">
                          <td className="py-2 pr-3">{r.email}</td>
                          <td className="py-2 pr-3">{r.phone || '-'}</td >
                          <td className="py-2 pr-3">{new Date(r.entradaISO).toLocaleString()}</td>
                          <td className="py-2 pr-3">{isPaid ? "pagado-manual" : r.status}</td>
                          <td className="py-2 pr-3">{est !== null ? new Intl.NumberFormat(undefined, { style: "currency", currency: "MXN" }).format(est) : 'N/A'}</td>
                          <td className="py-2 pr-3">
                            <div className="flex items-center justify-end gap-2">
                              {!isPaid && (
                                <PrimaryButton
                                  onClick={() => est !== null && markPaidMutation.mutate({ ticket: r, amount: est })}
                                  disabled={markPaidMutation.isLoading || est === null}
                                  title={est === null ? "La configuración de tarifa no está disponible para este estacionamiento." : ""}
                                >
                                  {markPaidMutation.isLoading && markPaidMutation.variables?.ticket.id === r.id
                                    ? 'Marcando...'
                                    : 'Marcar “Pagado Manual”'}
                                </PrimaryButton>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {qrDataUrl && qrFor && (
                <div className="mt-6 text-center border-t pt-6">
                  <h3 className="text-lg font-semibold">QR de Salida Generado</h3>
                  <p className="text-sm text-gray-600">Para ticket: <span className="font-mono text-xs break-all">{qrFor}</span></p>
                  <img src={qrDataUrl} alt="QR de salida" className="mx-auto h-44 w-44 my-4" />
                  <div className="mt-3">
                    <PrimaryButton onClick={printQR}>
                      <Printer className="h-4 w-4" /> Imprimir QR
                    </PrimaryButton>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

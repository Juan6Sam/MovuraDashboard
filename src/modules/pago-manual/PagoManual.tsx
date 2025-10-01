import React, { useMemo, useState } from "react";
import { Building2, Mail, User, MapPin, CalendarRange, Search, CheckCircle2, Printer } from "lucide-react";
import QRCode from "qrcode";

// Módulo de Pago Manual, basado en Archivosreferencia/06 PagoManual.txt

function cn(...classes) { return classes.filter(Boolean).join(" "); }

// --- Componentes de UI internos ---

function Card({ children, className }) {
  return <div className={cn("rounded-2xl border border-gray-200 bg-white p-6 shadow-sm", className)}>{children}</div>;
}

function Label({ children }) {
  return <span className="text-sm text-gray-600">{children}</span>;
}

function TextInput({ label, type = "text", value, onChange, placeholder, leftIcon }) {
  return (
    <label className="block">
      {label && <Label>{label}</Label>}
      <div className="mt-1 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm focus-within:border-sky-500">
        {leftIcon}
        <input
          className="w-full bg-transparent outline-none placeholder:text-gray-400"
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
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

function InfoChip({ icon, title, value }) {
    return <div className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm shadow-sm"><div className="text-gray-500">{icon}</div><div className="truncate"><span className="text-gray-500">{title}:</span> <span className="font-medium">{value || "-"}</span></div></div>;
}

// --- Datos de ejemplo y helpers ---

const PARKINGS = [
  { id: "p1", nombre: "Parking Centro", grupo: "Gpo. Alfa", adminNombre: "Laura Perez", adminCorreo: "laura.perez@parking.mx" },
  { id: "p2", nombre: "Plaza Norte", grupo: "Gpo. Beta", adminNombre: "Carlos Diaz", adminCorreo: "carlos.diaz@parking.mx" },
];

function genTickets(email, phone) {
    if (!email && !phone) return [];
    return [{
        id: `t${Date.now()}`,
        email: email || "n/a",
        phone: phone || "n/a",
        entradaISO: new Date(Date.now() - Math.random() * 3 * 60 * 60 * 1000).toISOString(), // max 3 hrs ago
        status: "abierto",
    }];
}

const formatDt = (iso) => new Date(iso).toLocaleString();
const formatMoney = (val) => `$${Number(val || 0).toFixed(2)}`;
const diffMins = (iso) => Math.round((Date.now() - new Date(iso).getTime()) / 60000);

// --- Componente Principal ---

export default function PagoManual() {
  const [selectedId, setSelectedId] = useState(PARKINGS[0].id);
  const parking = useMemo(() => PARKINGS.find(p => p.id === selectedId), [selectedId]);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [rows, setRows] = useState([]);
  const [paidTicketId, setPaidTicketId] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  
  const search = () => {
    const data = genTickets(email, phone);
    setRows(data);
    setPaidTicketId(null);
    setQrCodeUrl(null);
  };

  const markPaid = async (ticket) => {
      setPaidTicketId(ticket.id);
      const qr = await QRCode.toDataURL(`EXIT:${ticket.id}`);
      setQrCodeUrl(qr);
  };
  
  const printQR = () => {
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`<img src="${qrCodeUrl}" />`);
      printWindow.print();
  }

  return (
    <div className="flex h-full w-full flex-col bg-gray-50">
      <div className="border-b bg-white/70 backdrop-blur px-4 py-3">
        <div className="mx-auto max-w-7xl">
          <Select label="Selecciona estacionamiento" value={selectedId} onChange={setSelectedId} options={PARKINGS.map(p => ({ value: p.id, label: p.nombre }))} />
          <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
            <InfoChip icon={<Building2 size={16}/>} title="Grupo" value={parking?.grupo} />
            <InfoChip icon={<User size={16}/>} title="Admin" value={parking?.adminNombre} />
            <InfoChip icon={<Mail size={16}/>} title="Correo" value={parking?.adminCorreo} />
          </div>
        </div>
      </div>
      
      <div className="mx-auto w-full max-w-7xl p-4 space-y-4">
        <Card>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <TextInput label="Correo del usuario" type="email" value={email} onChange={setEmail} leftIcon={<Mail size={16}/>} />
            <TextInput label="Teléfono del usuario" type="tel" value={phone} onChange={setPhone} leftIcon={<User size={16}/>} />
            <div className="flex items-end"><PrimaryButton onClick={search} disabled={!email && !phone}><Search size={16}/> Buscar</PrimaryButton></div>
          </div>
        </Card>

        {rows.length > 0 && (
            <Card>
              <h2 className="text-lg font-semibold mb-4">Resultados</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead><tr className="border-b"><th className="py-2">Email/Tel</th><th className="py-2">Entrada</th><th className="py-2">Tiempo</th><th className="py-2">Estatus</th><th className="py-2 text-right">Acción</th></tr></thead>
                  <tbody>
                    {rows.map(r => {
                        const isPaid = paidTicketId === r.id;
                        return (
                            <tr key={r.id} className="border-b">
                                <td className="py-2">{r.email} / {r.phone}</td>
                                <td className="py-2">{formatDt(r.entradaISO)}</td>
                                <td className="py-2">{diffMins(r.entradaISO)} min</td>
                                <td className="py-2 font-medium">{isPaid ? "PAGADO" : r.status.toUpperCase()}</td>
                                <td className="py-2 text-right">{isPaid ? <PrimaryButton onClick={printQR}><Printer size={16}/>Imprimir QR</PrimaryButton> : <PrimaryButton onClick={() => markPaid(r)}><CheckCircle2 size={16}/>Marcar Pagado</PrimaryButton>}</td>
                            </tr>
                        )
                    })}
                  </tbody>
                </table>
              </div>
              {qrCodeUrl && (
                  <div className="mt-4 text-center">
                      <h3 className="font-semibold">QR de Salida</h3>
                      <img src={qrCodeUrl} alt="QR Code" className="mx-auto" />
                  </div>
              )}
            </Card>
        )}
      </div>
    </div>
  );
}

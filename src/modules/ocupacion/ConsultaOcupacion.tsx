import React, { useMemo, useState } from "react";
import { Building2, Mail, User, MapPin, CalendarClock, CreditCard, CalendarRange, Download } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import * as XLSX from "xlsx";

// Módulo de Consulta de Ocupación, basado en Archivosreferencia/04 ConsultaOcupacion.txt

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

const TICKET_STATUSES = ["abierto", "pagado", "cancelado"];

function genTickets(startISO, endISO, count = 100) {
  const start = new Date(startISO).getTime();
  const end = new Date(endISO).getTime();
  if (isNaN(start) || isNaN(end) || start > end) return [];
  
  const tickets = [];
  for (let i = 0; i < count; i++) {
    const entrada = start + Math.random() * (end - start);
    const salida = entrada + Math.random() * (2 * 60 * 60 * 1000); // hasta 2 horas después
    tickets.push({
      id: `t${i}`,
      email: `user${i}@example.com`,
      entradaISO: new Date(entrada).toISOString(),
      salidaISO: new Date(salida).toISOString(),
      status: TICKET_STATUSES[Math.floor(Math.random() * TICKET_STATUSES.length)],
    });
  }
  return tickets;
}

const formatDt = (iso) => new Date(iso).toLocaleString();

// --- Componente Principal del Módulo ---

export default function ConsultaOcupacion() {
  const [selectedId, setSelectedId] = useState(PARKINGS[0].id);
  const parking = useMemo(() => PARKINGS.find(p => p.id === selectedId), [selectedId]);

  const today = new Date().toISOString().split('T')[0];
  const [start, setStart] = useState(`${today}T00:00`);
  const [end, setEnd] = useState(`${today}T23:59`);
  
  const [rows, setRows] = useState([]);
  const [ranAt, setRanAt] = useState(null);

  const consult = () => {
    const data = genTickets(start, end);
    setRows(data);
    setRanAt(new Date().toISOString());
  };
  
  const pieData = useMemo(() => {
    const counts = rows.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [rows]);

  const COLORS = { abierto: '#3b82f6', pagado: '#10b981', cancelado: '#f97316' };

  const exportXLSX = () => {
    const header = [["Reporte de Ocupacion"], ["Estacionamiento", parking.nombre], ["Desde", formatDt(start)], ["Hasta", formatDt(end)], ["Generado", formatDt(ranAt)]];
    const data = rows.map(r => ({ Email: r.email, Entrada: formatDt(r.entradaISO), Salida: formatDt(r.salidaISO), Estatus: r.status }));
    
    const wb = XLSX.utils.book_new();
    const ws_header = XLSX.utils.aoa_to_sheet(header);
    const ws_data = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws_header, "Resumen");
    XLSX.utils.book_append_sheet(wb, ws_data, "Detalle");
    XLSX.writeFile(wb, `Ocupacion_${parking.id}_${new Date().getTime()}.xlsx`);
  };

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
            <TextInput label="Fecha y hora inicial" type="datetime-local" value={start} onChange={setStart} />
            <TextInput label="Fecha y hora final" type="datetime-local" value={end} onChange={setEnd} />
            <div className="flex items-end"><PrimaryButton onClick={consult}>Consultar</PrimaryButton></div>
          </div>
        </Card>

        {rows.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Resultados</h2>
                <PrimaryButton onClick={exportXLSX}><Download size={16}/>Exportar</PrimaryButton>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead><tr className="border-b"><th className="py-2">Email</th><th className="py-2">Entrada</th><th className="py-2">Salida</th><th className="py-2">Estatus</th></tr></thead>
                  <tbody>
                    {rows.map(r => <tr key={r.id} className="border-b"><td className="py-2">{r.email}</td><td className="py-2">{formatDt(r.entradaISO)}</td><td className="py-2">{formatDt(r.salidaISO)}</td><td>{r.status}</td></tr>)}
                  </tbody>
                </table>
              </div>
            </Card>
            <Card>
              <h2 className="text-lg font-semibold mb-4">Distribución</h2>
              <div style={{width: '100%', height: 300}}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

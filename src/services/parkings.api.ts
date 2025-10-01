import { api } from "./apiClient";

const USE_MOCK = (import.meta.env.VITE_USE_MOCK ?? "true").toString() !== "false";

/** TYPES */
export type Parking = {
  id: string;
  nombre: string;
  direccion?: string;
  grupo?: string;
  adminNombre?: string;
  adminCorreo?: string;
  altaISO?: string;
  estatus?: string;
  config?: any;
  comercios?: any[];
};

export type Ticket = { id: string; email: string; entradaISO: string; salidaISO: string; status: string; phone?: string };
export type Transaction = { id: string; email: string; entradaISO: string; salidaISO: string; minutes: number; status: string; monto: number; excedente: number; total: number };

/** MOCK DATA */
const PARKINGS: Parking[] = [
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
    comercios: [
      { id: "c1", nombre: "Café Central", tipo: "monto", valor: 50, usuarios: ["cortesias@cafecentral.mx"], estatus: "Activo" },
      { id: "c2", nombre: "Librería Athenas", tipo: "tiempo", valor: 30, usuarios: ["promo@athenas.mx"], estatus: "Activo" },
    ],
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
    comercios: [
      { id: "c3", nombre: "Cineplex", tipo: "tiempo", valor: 60, usuarios: ["taquilla@cineplex.mx"], estatus: "Activo" },
    ],
  },
];

/** HELPERS (mocks) */
function randBetween(a: number, b: number) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function randomEmail(i: number) { return `usuario${i}@correo.mx`; }

export async function getParkings(): Promise<Parking[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    return PARKINGS;
  }
  const res = await api.get("/parkings");
  return res.data;
}

export async function getParkingById(id: string): Promise<Parking | null> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    return PARKINGS.find((p) => p.id === id) ?? null;
  }
  const res = await api.get(`/parkings/${encodeURIComponent(id)}`);
  return res.data;
}

export async function updateComercios(parkingId: string, comercios: any[]) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    const p = PARKINGS.find((x) => x.id === parkingId);
    if (p) p.comercios = comercios;
    return comercios;
  }
  const res = await api.put(`/parkings/${encodeURIComponent(parkingId)}/comercios`, comercios);
  return res.data;
}

/** Generate mock tickets constrained to a range */
export function genTickets(parkingId: string, startISO: string, endISO: string, n = 120): Ticket[] {
  const start = new Date(startISO).getTime();
  const end = new Date(endISO).getTime();
  if (isNaN(start) || isNaN(end) || start > end) return [];
  const TICKET_STATUSES = ["abierto", "pagado", "cancelado"];
  const rows: Ticket[] = [];
  for (let i = 0; i < n; i++) {
    const inTs = randBetween(start, end);
    const outTs = inTs + randBetween(10, 240) * 60 * 1000;
    const status = TICKET_STATUSES[randBetween(0, TICKET_STATUSES.length - 1)];
    rows.push({
      id: `${parkingId}-t-${i}-${inTs}`,
      email: randomEmail(i),
      entradaISO: new Date(inTs).toISOString(),
      salidaISO: new Date(Math.min(outTs, end)).toISOString(),
      status,
      phone: `55${randBetween(10000000, 99999999)}`
    });
  }
  rows.sort((a, b) => new Date(a.entradaISO).getTime() - new Date(b.entradaISO).getTime());
  return rows;
}

export function genTransactions(parkingId: string, startISO: string, endISO: string, n = 120): Transaction[] {
  const start = new Date(startISO).getTime();
  const end = new Date(endISO).getTime();
  if (isNaN(start) || isNaN(end) || start > end) return [];
  const TICKET_STATUSES = ["abierto", "pagado", "cancelado"];
  const rows: Transaction[] = [];
  for (let i = 0; i < n; i++) {
    const inTs = randBetween(start, end);
    const stayMin = randBetween(10, 240);
    const outTs = inTs + stayMin * 60 * 1000;
    const status = TICKET_STATUSES[randBetween(0, TICKET_STATUSES.length - 1)];
    const monto = Number((Math.random() * 150 + 20).toFixed(2));
    const excedente = Number((Math.random() * 40).toFixed(2));
    const total = Number((monto + excedente).toFixed(2));
    rows.push({
      id: `${parkingId}-tr-${i}-${inTs}`,
      email: randomEmail(i),
      entradaISO: new Date(inTs).toISOString(),
      salidaISO: new Date(Math.min(outTs, end)).toISOString(),
      minutes: stayMin,
      status,
      monto,
      excedente,
      total
    });
  }
  rows.sort((a, b) => new Date(a.entradaISO).getTime() - new Date(b.entradaISO).getTime());
  return rows;
}

/** API wrappers */

export async function getOccupancyReport(parkingId: string, startISO: string, endISO: string) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    return genTickets(parkingId, startISO, endISO, 80);
  }
  const res = await api.get(`/parkings/${encodeURIComponent(parkingId)}/reports/occupancy`, { params: { start: startISO, end: endISO } });
  return res.data;
}

export async function getTransactionsReport(parkingId: string, startISO: string, endISO: string) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    return genTransactions(parkingId, startISO, endISO, 120);
  }
  const res = await api.get(`/parkings/${encodeURIComponent(parkingId)}/reports/transactions`, { params: { start: startISO, end: endISO } });
  return res.data;
}

export async function getManualSearch(parkingId: string, startISO: string, email?: string, phone?: string) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 350));
    if (!email && !phone) return [];
    const n = Math.random() < 0.8 ? 1 : 2;
    const rows: Ticket[] = [];
    for (let i = 0; i < n; i++) {
      rows.push({
        id: `${parkingId}-manual-${Date.now()}-${i}`,
        email: email || `user${i}@mail.com`,
        phone: phone || `55${randBetween(10000000, 99999999)}`,
        entradaISO: new Date(Date.now() - randBetween(5, 240) * 60 * 1000).toISOString(),
        salidaISO: new Date().toISOString(),
        status: "abierto"
      });
    }
    return rows;
  }
  const res = await api.get(`/parkings/${encodeURIComponent(parkingId)}/manual-search`, { params: { start: startISO, email, phone } });
  return res.data;
}

export async function markTicketPaid(parkingId: string, ticketId: string, amount?: number) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    const payload = { parkingId, ticketId, amount, issuedAt: new Date().toISOString() };
    const qrToken = btoa(JSON.stringify(payload));
    return { success: true, qrToken };
  }
  const res = await api.post(`/parkings/${encodeURIComponent(parkingId)}/tickets/${encodeURIComponent(ticketId)}/mark-paid`, { amount });
  return res.data;
}

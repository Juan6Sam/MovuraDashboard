import React, { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { Menu, KeyRound, CreditCard, ShoppingBag, PieChart, Wallet, ChevronRight, Building2 } from "lucide-react";
import GestionDeTarifas from "../modules/tarifas/GestionDeTarifas";
import ComerciosAsociados from "../modules/comercios/ComerciosAsociados";
import ConsultaOcupacion from "../modules/ocupacion/ConsultaOcupacion";
import ConsultaTransacciones from "../modules/transacciones/ConsultaTransacciones";
import PagoManual from "../modules/pago-manual/PagoManual"; // <-- 1. IMPORTAR

const MENU_ITEMS = [
  { key: "tarifas", label: "Gestión de Tarifas", icon: <CreditCard className="h-4 w-4" /> },
  { key: "comercios", label: "Comercios Asociados", icon: <ShoppingBag className="h-4 w-4" /> },
  { key: "ocupacion", label: "Consulta de Ocupación", icon: <PieChart className="h-4 w-4" /> },
  { key: "transacciones", label: "Consulta de Transacciones", icon: <Wallet className="h-4 w-4" /> },
  { key: "pago-manual", label: "Pago Manual", icon: <KeyRound className="h-4 w-4" /> },
];

// --- Componentes internos (sin cambios) ---
function Brand() { return <div className="font-semibold tracking-tight text-lg">Movura Admin</div>; }
function Avatar({ username }) { const initial = (username?.trim()?.[0] || "U").toUpperCase(); return <div title={username || "Usuario"} className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-600 text-white font-semibold">{initial}</div>; }
function Sidebar({ collapsed, onToggle, active, setActive }) {
    return (
        <aside className={`relative flex h-full flex-col border-r bg-white transition-all ${collapsed ? "w-16" : "w-64"}`}>
            <div className="flex items-center justify-between p-4">
                {!collapsed && <Brand />}
                <button onClick={onToggle} className="rounded-xl p-2 hover:bg-gray-100"><Menu size={20} /></button>
            </div>
            <nav className="flex-1 space-y-1 p-2">
                {MENU_ITEMS.map((item) => (
                    <button key={item.key} onClick={() => setActive(item.key)} className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm ${active === item.key ? "bg-sky-50 text-sky-700" : "hover:bg-gray-100"}`}>
                        {item.icon} {!collapsed && <span className="truncate">{item.label}</span>} {!collapsed && <ChevronRight className="ml-auto h-4 w-4 opacity-40" />}
                    </button>
                ))}
            </nav>
        </aside>
    );
}
function Topbar({ onLogout, user }) {
    return (
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-white px-4">
            <div className="text-sm text-gray-500">Panel del Administrador</div>
            <div className="flex items-center gap-3">
                <div className="hidden sm:block text-sm text-gray-600">{user?.username || "Usuario"}</div>
                <Avatar username={user?.username} />
                <button onClick={onLogout} className="text-sm text-gray-600 hover:text-sky-600">Cerrar sesión</button>
            </div>
        </header>
    );
}
function HomeContent({ user }) { return <div className="p-6"><div className="text-lg font-semibold">Bienvenido, {user?.username || "Usuario"}</div><p className="mt-1 text-sm text-gray-600">Usa el menú lateral.</p></div>; }
function Placeholder({ title }) { return <div className="p-6"><div className="text-lg font-semibold">{title}</div><p className="mt-1 text-sm text-gray-600">(Próximamente)</p></div>; }

// --- Layout Principal ---
export default function ProtectedLayout() {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState(null);

  const title = useMemo(() => !active ? "Inicio" : MENU_ITEMS.find(m => m.key === active)?.label || "", [active]);

  const renderContent = () => {
    // --- 2. LÓGICA DE RENDERIZADO FINAL ---
    switch (active) {
      case null:
        return <HomeContent user={user} />;
      case 'tarifas':
        return <GestionDeTarifas />;
      case 'comercios':
        return <ComerciosAsociados />;
      case 'ocupacion':
        return <ConsultaOcupacion />;
      case 'transacciones':
        return <ConsultaTransacciones />;
      case 'pago-manual':
        return <PagoManual />;
      default:
        return <HomeContent user={user} />; // Fallback
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} active={active} setActive={setActive} />
      <main className="flex min-w-0 flex-1 flex-col">
        <Topbar onLogout={logout} user={user} />
        <div className="border-b px-4 py-3 text-sm font-semibold text-gray-700">{title}</div>
        <div className="min-h-0 flex-1 overflow-y-auto">{renderContent()}</div>
      </main>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import {
  getMisProyectos, getMisFacturas, getMisTickets, getMisReuniones,
  getAdminProyectos, getAdminTickets, getAdminReuniones, getClientes,
  getUsuarioGuardado,
} from "@/libs/api";
import LoadingSpinner from "@/components/shared/loading-spinner";

function hora() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

function fmt(fecha: string) {
  return new Date(fecha).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtHora(fecha: string) {
  return new Date(fecha).toLocaleString("es-PE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function diasRestantes(fecha: string) {
  const diff = new Date(fecha).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

const ESTADO_COLOR: Record<string, string> = {
  pendiente: "#f59e0b", en_progreso: "var(--verde)", completado: "#3b82f6", pausado: "#6b7280",
};

const PRIORIDAD_COLOR: Record<string, string> = {
  baja: "#22c55e", media: "#f59e0b", alta: "#ef4444", urgente: "#dc2626",
};

// ── Stat card ────────────────────────────────────────────────────
function StatCard({ icon, value, label, sub, subColor = "var(--verde)" }: {
  icon: string; value: string; label: string; sub: string; subColor?: string;
}) {
  return (
    <div className="dash-el" style={{
      opacity: 0, padding: "1.25rem", borderRadius: "14px",
      background: "var(--bg)", border: "1px solid var(--border)",
      display: "flex", flexDirection: "column", gap: "0.35rem",
    }}>
      <div style={{
        width: "34px", height: "34px", borderRadius: "9px",
        background: "rgba(74,139,0,0.08)", border: "1px solid rgba(74,139,0,0.12)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "var(--verde)", marginBottom: "0.25rem",
      }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "18px", height: "18px" }}>
          <path d={icon} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p style={{ fontSize: "1.9rem", fontWeight: 800, color: "var(--text-primary)", margin: 0, lineHeight: 1, fontFamily: "'Google Sans', system-ui" }}>
        {value}
      </p>
      <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", margin: 0, fontWeight: 500 }}>{label}</p>
      <p style={{ fontSize: "0.68rem", color: subColor, margin: 0, fontWeight: 600 }}>{sub}</p>
    </div>
  );
}

// ── Section header ───────────────────────────────────────────────
function SectionHeader({ title, count, href, router }: { title: string; count?: number; href?: string; router?: any }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.85rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <h3 style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{title}</h3>
        {count !== undefined && (
          <span style={{ fontSize: "0.6rem", fontWeight: 700, padding: "0.1rem 0.45rem", borderRadius: "999px", background: "var(--bg-soft)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
            {count}
          </span>
        )}
      </div>
      {href && router && (
        <button onClick={() => router.push(href)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.7rem", color: "var(--verde)", fontWeight: 600 }}>
          Ver todos →
        </button>
      )}
    </div>
  );
}

// ── Card wrapper ─────────────────────────────────────────────────
function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className} style={{
      opacity: 0, padding: "1.25rem 1.5rem", borderRadius: "14px",
      background: "var(--bg)", border: "1px solid var(--border)",
    }}>
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [usuario] = useState(() => getUsuarioGuardado());
  const isAdmin = usuario?.rol === "admin" || usuario?.rol === "subadmin";

  const [proyectos, setProyectos] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [reuniones, setReuniones] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [facturas, setFacturas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        if (isAdmin) {
          const [p, t, r, c] = await Promise.all([
            getAdminProyectos(),
            getAdminTickets(),
            getAdminReuniones(),
            getClientes(),
          ]);
          setProyectos(p); setTickets(t); setReuniones(r);
          setClientes(c.filter((u: any) => u.rol === "cliente"));
        } else {
          const [p, f, t, r] = await Promise.all([
            getMisProyectos(), getMisFacturas(), getMisTickets(), getMisReuniones(),
          ]);
          setProyectos(p); setFacturas(f); setTickets(t); setReuniones(r);
        }
      } catch {}
      finally { setLoading(false); }
    };
    cargar();
  }, [isAdmin]);

  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".dash-el", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: "power3.out" });
    }, pageRef);
    return () => ctx.revert();
  }, [loading]);

  // ── Cálculos admin ───────────────────────────────────────────────
  const hoy = new Date();
  const proyectosActivos    = proyectos.filter((p) => p.estado !== "completado" && p.estado !== "pausado");
  const proximosVencer      = proyectos.filter((p) => {
    if (!p.fechaEntrega || p.estado === "completado") return false;
    const dias = diasRestantes(p.fechaEntrega);
    return dias >= 0 && dias <= 7;
  }).sort((a, b) => new Date(a.fechaEntrega).getTime() - new Date(b.fechaEntrega).getTime());

  const reunionesFuturas    = reuniones.filter((r) => new Date(r.fecha) >= hoy).sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  const reunionesPasadas    = reuniones.filter((r) => new Date(r.fecha) < hoy).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  const ticketsAbiertos     = tickets.filter((t) => t.estado === "abierto" || t.estado === "pendiente");
  const clientesActivos     = clientes.filter((c) => c.activo);

  const statsAdmin = [
    {
      icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
      value: String(clientesActivos.length),
      label: "Clientes activos",
      sub: `${clientes.length} registrados`,
    },
    {
      icon: "M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z",
      value: String(proyectosActivos.length),
      label: "Proyectos activos",
      sub: `${proyectos.length} en total`,
    },
    {
      icon: "M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z",
      value: String(ticketsAbiertos.length),
      label: "Tickets sin resolver",
      sub: `${tickets.length} en total`,
      subColor: ticketsAbiertos.length > 0 ? "#f59e0b" : "var(--verde)",
    },
    {
      icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
      value: String(reunionesFuturas.length),
      label: "Reuniones próximas",
      sub: reunionesFuturas[0] ? fmtHora(reunionesFuturas[0].fecha) : "Sin reuniones",
    },
  ];

  if (loading) return <LoadingSpinner text="Cargando dashboard..." />;

  return (
    <div ref={pageRef} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Header */}
      <div className="dash-el" style={{ opacity: 0 }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
          {hora()}, {usuario?.nombre?.split(" ")[0] ?? "Admin"}
        </h1>
        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "0.25rem 0 0" }}>
          {isAdmin ? "Resumen general de HannahLab" : "Aquí tienes un resumen de tus proyectos y servicios activos."}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.85rem" }}>
        {(isAdmin ? statsAdmin : [
          { icon: "M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z", value: String(proyectos.filter(p => p.estado !== "completado").length), label: "Proyectos activos", sub: `${proyectos.length} en total` },
          { icon: "M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z", value: String(facturas.filter(f => f.estado === "pendiente").length), label: "Facturas pendientes", sub: `${facturas.length} facturas` },
          { icon: "M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z", value: String(tickets.filter(t => t.estado === "abierto" || t.estado === "pendiente").length), label: "Tickets abiertos", sub: `${tickets.length} en total` },
          { icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5", value: reuniones.filter(r => new Date(r.fecha) >= hoy).length > 0 ? new Date(reuniones.filter(r => new Date(r.fecha) >= hoy).sort((a,b) => new Date(a.fecha).getTime()-new Date(b.fecha).getTime())[0].fecha).toLocaleDateString("es-PE",{day:"2-digit",month:"short"}) : "—", label: "Próxima reunión", sub: reuniones.filter(r => new Date(r.fecha) >= hoy).sort((a,b) => new Date(a.fecha).getTime()-new Date(b.fecha).getTime())[0]?.titulo ?? "Sin reuniones" },
        ]).map((s: any) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {isAdmin ? (
        /* ── VISTA ADMIN ── */
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          {/* Fila 1: Proyectos por vencer + Tickets */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>

            {/* Proyectos próximos a vencer */}
            <Card className="dash-el">
              <SectionHeader title="Proyectos por vencer" count={proximosVencer.length} href="/dashboard/admin/proyectos" router={router} />
              {proximosVencer.length === 0 ? (
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", padding: "1rem 0" }}>
                  Ningún proyecto vence en los próximos 7 días. 🎉
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {proximosVencer.slice(0, 5).map((p) => {
                    const dias = diasRestantes(p.fechaEntrega);
                    const urgente = dias <= 2;
                    return (
                      <div
                        key={p.id}
                        onClick={() => router.push(`/dashboard/admin/proyectos/${p.id}`)}
                        style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 0.75rem", borderRadius: "10px", cursor: "pointer", border: `1px solid ${urgente ? "rgba(239,68,68,0.2)" : "var(--border)"}`, background: urgente ? "rgba(239,68,68,0.03)" : "var(--bg-soft)", transition: "all 0.15s" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--verde)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = urgente ? "rgba(239,68,68,0.2)" : "var(--border)"; }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.nombre}</p>
                          <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", margin: "0.1rem 0 0" }}>
                            {p.cliente?.nombre ?? "Sin cliente"}
                          </p>
                        </div>
                        <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "0.2rem 0.5rem", borderRadius: "999px", background: urgente ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)", color: urgente ? "#ef4444" : "#f59e0b", border: `1px solid ${urgente ? "#ef4444" : "#f59e0b"}`, whiteSpace: "nowrap", flexShrink: 0 }}>
                          {dias === 0 ? "Hoy" : dias === 1 ? "Mañana" : `${dias}d`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Tickets recientes */}
            <Card className="dash-el">
              <SectionHeader title="Tickets de clientes" count={ticketsAbiertos.length} href="/dashboard/admin/tickets" router={router} />
              {ticketsAbiertos.length === 0 ? (
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", padding: "1rem 0" }}>No hay tickets pendientes. 🎉</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {ticketsAbiertos.slice(0, 5).map((t) => (
                    <div key={t.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 0.75rem", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--bg-soft)" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0, background: PRIORIDAD_COLOR[t.prioridad] ?? "#888" }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.titulo}</p>
                        <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", margin: "0.1rem 0 0" }}>
                          {t.cliente?.nombre ?? "—"} · {t.prioridad}
                        </p>
                      </div>
                      <span style={{ fontSize: "0.6rem", fontWeight: 700, padding: "0.15rem 0.45rem", borderRadius: "999px", background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid #f59e0b", flexShrink: 0 }}>
                        {t.estado.replace("_", " ")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Fila 2: Reuniones próximas + Proyectos activos */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>

            {/* Reuniones */}
            <Card className="dash-el">
              <SectionHeader title="Reuniones" href="/dashboard/admin/reuniones" router={router} />
              {reuniones.length === 0 ? (
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", padding: "1rem 0" }}>No hay reuniones programadas.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {/* Próximas */}
                  {reunionesFuturas.slice(0, 3).map((r) => (
                    <div key={r.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 0.75rem", borderRadius: "10px", border: "1px solid rgba(74,139,0,0.2)", background: "rgba(74,139,0,0.04)" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(74,139,0,0.1)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--verde)", lineHeight: 1 }}>{new Date(r.fecha).getDate()}</span>
                        <span style={{ fontSize: "0.55rem", color: "var(--verde)", textTransform: "uppercase" }}>{new Date(r.fecha).toLocaleString("es-PE",{month:"short"})}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-primary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.titulo}</p>
                        <p style={{ fontSize: "0.67rem", color: "var(--text-muted)", margin: "0.1rem 0 0" }}>
                          {new Date(r.fecha).toLocaleTimeString("es-PE",{hour:"2-digit",minute:"2-digit"})}
                          {r.cliente ? ` · ${r.cliente.nombre}` : ""}
                        </p>
                      </div>
                      {r.linkMeet && (
                        <a href={r.linkMeet} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ fontSize: "0.65rem", fontWeight: 600, padding: "0.2rem 0.5rem", borderRadius: "6px", background: "rgba(74,139,0,0.1)", color: "var(--verde)", border: "1px solid var(--verde)", textDecoration: "none", flexShrink: 0 }}>
                          Unirse
                        </a>
                      )}
                    </div>
                  ))}
                  {/* Pasadas */}
                  {reunionesPasadas.slice(0, 2).map((r) => (
                    <div key={r.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0.75rem", borderRadius: "10px", border: "1px solid var(--border)", opacity: 0.6 }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "var(--bg-soft)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)", lineHeight: 1 }}>{new Date(r.fecha).getDate()}</span>
                        <span style={{ fontSize: "0.55rem", color: "var(--text-muted)", textTransform: "uppercase" }}>{new Date(r.fecha).toLocaleString("es-PE",{month:"short"})}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "0.78rem", fontWeight: 500, color: "var(--text-secondary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.titulo}</p>
                        <p style={{ fontSize: "0.65rem", color: "var(--text-muted)", margin: "0.1rem 0 0" }}>Finalizada</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Proyectos activos */}
            <Card className="dash-el">
              <SectionHeader title="Proyectos en curso" count={proyectosActivos.length} href="/dashboard/admin/proyectos" router={router} />
              {proyectosActivos.length === 0 ? (
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", padding: "1rem 0" }}>No hay proyectos activos.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                  {proyectosActivos.slice(0, 5).map((p) => {
                    const color = ESTADO_COLOR[p.estado] ?? "#6b7280";
                    return (
                      <div
                        key={p.id}
                        onClick={() => router.push(`/dashboard/admin/proyectos/${p.id}`)}
                        style={{ cursor: "pointer", padding: "0.6rem 0.75rem", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--bg-soft)", transition: "all 0.15s" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--verde)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)"; }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                          <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{p.nombre}</p>
                          <span style={{ fontSize: "0.6rem", fontWeight: 700, padding: "0.15rem 0.45rem", borderRadius: "999px", background: `${color}18`, color, border: `1px solid ${color}`, marginLeft: "0.5rem", flexShrink: 0 }}>
                            {p.estado?.replace("_", " ")}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <div style={{ flex: 1, height: "4px", borderRadius: "999px", background: "var(--border)" }}>
                            <div style={{ height: "100%", borderRadius: "999px", width: `${p.progreso ?? 0}%`, background: "var(--verde)", transition: "width 0.4s" }} />
                          </div>
                          <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--verde)", minWidth: "2rem", textAlign: "right" }}>{p.progreso ?? 0}%</span>
                        </div>
                        {p.cliente && <p style={{ fontSize: "0.65rem", color: "var(--text-muted)", margin: "0.25rem 0 0" }}>{p.cliente.nombre}{p.cliente.empresa ? ` · ${p.cliente.empresa}` : ""}</p>}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>
      ) : (
        /* ── VISTA CLIENTE ── */
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <Card className="dash-el">
            <SectionHeader title="Tickets recientes" count={tickets.length} />
            {tickets.length === 0 ? <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>No hay tickets.</p> : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {tickets.slice(0, 5).map((t) => (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0.75rem", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--bg-soft)" }}>
                    <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: PRIORIDAD_COLOR[t.prioridad] ?? "#888", flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{t.titulo}</p>
                      <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", margin: 0 }}>{t.prioridad} · {t.estado}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
          <Card className="dash-el">
            <SectionHeader title="Mis proyectos" count={proyectos.length} />
            {proyectos.length === 0 ? <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>No hay proyectos asignados.</p> : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {proyectos.slice(0, 5).map((p) => (
                  <div key={p.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                      <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{p.nombre}</p>
                      <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--verde)" }}>{p.progreso ?? 0}%</span>
                    </div>
                    <div style={{ height: "5px", borderRadius: "999px", background: "var(--bg-soft)" }}>
                      <div style={{ height: "100%", width: `${p.progreso ?? 0}%`, borderRadius: "999px", background: "var(--verde)" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Ayuda */}
      <div className="dash-el" style={{ opacity: 0 }}>
        <div style={{ padding: "1rem 1.5rem", borderRadius: "14px", background: "var(--bg)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>¿Necesitas ayuda?</p>
            <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: 0 }}>Nuestro equipo está disponible 24/7</p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <a href="https://wa.me/51925223153" target="_blank" rel="noopener noreferrer" style={{ padding: "0.45rem 0.9rem", borderRadius: "9px", fontSize: "0.78rem", fontWeight: 600, textDecoration: "none", background: "#25D366", color: "#fff", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: "13px", height: "13px" }}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /></svg>
              WhatsApp
            </a>
            <a href="mailto:operaciones@hannahlab.com" style={{ padding: "0.45rem 0.9rem", borderRadius: "9px", fontSize: "0.78rem", fontWeight: 600, textDecoration: "none", background: "var(--bg-soft)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
              Email
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

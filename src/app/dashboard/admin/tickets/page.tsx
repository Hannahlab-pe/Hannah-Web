"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAdminTickets } from "@/libs/api";
import LoadingSpinner from "@/components/shared/loading-spinner";
import PageHeader from "@/components/shared/page-header";

const PRIORIDAD_COLOR: Record<string, string> = {
  baja: "#22c55e", media: "#f59e0b", alta: "#ef4444", urgente: "#dc2626",
};
const ESTADO_COLOR: Record<string, string> = {
  abierto: "#f59e0b", en_progreso: "#3b82f6", resuelto: "var(--verde)", cerrado: "#6b7280",
};
const ESTADO_LABEL: Record<string, string> = {
  abierto: "Abierto", en_progreso: "Respondido", resuelto: "Resuelto", cerrado: "Cerrado",
};
const TIPO_CONFIG: Record<string, { label: string; color: string }> = {
  comentario: { label: "Comentario", color: "#6B7280" },
  aporte:     { label: "Aporte",     color: "#2563EB" },
  incidencia: { label: "Incidencia", color: "#D97706" },
  bug:        { label: "Bug",        color: "#DC2626" },
};

// SVG icons
function IconChat({ size = 11, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}
function IconLightbulb({ size = 11, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
      <path d="M9 21h6M12 3a6 6 0 016 6c0 2.22-1.21 4.16-3 5.2V18H9v-3.8C7.21 13.16 6 11.22 6 9a6 6 0 016-6z" />
    </svg>
  );
}
function IconAlertTriangle({ size = 11, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
function IconBug({ size = 11, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
      <path d="M8 2l1.88 1.88M14.12 3.88L16 2M9 7.13v-1a3.003 3.003 0 116 0v1" />
      <path d="M12 20c-3.3 0-6-2.7-6-6v-3a6 6 0 0112 0v3c0 3.3-2.7 6-6 6z" />
      <path d="M6 13H2M22 13h-4M6 19l-2 2M18 19l2 2M6 7l-2-2M18 7l2-2" />
    </svg>
  );
}
function TipoIconSmall({ tipo, size = 11, color = "currentColor" }: { tipo: string; size?: number; color?: string }) {
  switch (tipo) {
    case "aporte":     return <IconLightbulb size={size} color={color} />;
    case "incidencia": return <IconAlertTriangle size={size} color={color} />;
    case "bug":        return <IconBug size={size} color={color} />;
    default:           return <IconChat size={size} color={color} />;
  }
}

function Chip({ label, color }: { label: string; color: string }) {
  return (
    <span style={{ display: "inline-flex", padding: "0.15rem 0.5rem", borderRadius: "999px", fontSize: "0.65rem", fontWeight: 600, background: `${color}18`, color, border: `1px solid ${color}` }}>
      {label}
    </span>
  );
}
function TipoChipAdmin({ tipo }: { tipo: string }) {
  const cfg = TIPO_CONFIG[tipo?.toLowerCase()] ?? TIPO_CONFIG.comentario;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.15rem 0.5rem", borderRadius: "999px", fontSize: "0.65rem", fontWeight: 600, background: `${cfg.color}18`, color: cfg.color, border: `1px solid ${cfg.color}` }}>
      <TipoIconSmall tipo={tipo} size={10} color={cfg.color} />
      {cfg.label}
    </span>
  );
}

export default function AdminTicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<string>("todos");

  useEffect(() => {
    setLoading(true);
    getAdminTickets().then(setTickets).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = tickets.filter((t) => {
    if (filtro === "todos") return true;
    if (filtro === "abierto") return t.estado === "abierto";
    if (filtro === "en_progreso") return t.estado === "en_progreso";
    if (filtro === "resuelto") return ["resuelto", "cerrado"].includes(t.estado);
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
        <PageHeader
          title="Tickets de soporte"
          subtitle={`${tickets.length} ticket${tickets.length !== 1 ? "s" : ""}`}
        />
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          {[["todos","Todos"],["abierto","Abiertos"],["en_progreso","En progreso"],["resuelto","Resueltos"]].map(([k,l]) => (
            <button key={k} onClick={() => setFiltro(k)} style={{
              padding: "0.35rem 0.85rem", borderRadius: "7px", border: "1px solid",
              borderColor: filtro === k ? "var(--verde)" : "var(--border)",
              background: filtro === k ? "rgba(74,139,0,0.08)" : "var(--bg)",
              color: filtro === k ? "var(--verde)" : "var(--text-secondary)",
              fontSize: "0.78rem", fontWeight: 500, cursor: "pointer",
            }}>{l}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Cargando tickets..." />
      ) : filtered.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center", padding: "3rem 0" }}>No hay tickets.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {filtered.map((t) => (
            <div
              key={t.id}
              onClick={() => router.push(`/dashboard/admin/tickets/${t.id}`)}
              style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden", cursor: "pointer", transition: "border-color 0.15s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--verde)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)"; }}
            >
              <div style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text-primary)", margin: 0 }}>{t.titulo}</p>
                  {t.cliente && <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", margin: "0.15rem 0 0" }}>{t.cliente.nombre} · {t.cliente.email}</p>}
                  {t.proyecto && (
                    <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", margin: "0.1rem 0 0", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={10} height={10}>
                        <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                      </svg>
                      {t.proyecto.nombre}
                    </p>
                  )}
                  {t.asignadoA && (
                    <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", margin: "0.1rem 0 0" }}>
                      Asignado a: <strong style={{ color: "var(--text-secondary)" }}>{t.asignadoA.nombre}</strong>
                    </p>
                  )}
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0, flexWrap: "wrap", alignItems: "center" }}>
                  {t.tipo && <TipoChipAdmin tipo={t.tipo} />}
                  <Chip label={t.prioridad} color={PRIORIDAD_COLOR[t.prioridad] ?? "#888"} />
                  <Chip label={ESTADO_LABEL[t.estado] ?? t.estado} color={ESTADO_COLOR[t.estado] ?? "#888"} />
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={14} height={14} style={{ color: "var(--text-muted)", flexShrink: 0 }}>
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

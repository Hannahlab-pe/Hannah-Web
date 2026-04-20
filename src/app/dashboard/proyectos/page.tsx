"use client";

import { useState, useEffect } from "react";
import { getMisProyectos } from "@/libs/api";

const ESTADO_MAP: Record<string, { label: string; bg: string; text: string }> = {
  pendiente:   { label: "Pendiente",   bg: "rgba(245,158,11,0.1)",  text: "#F59E0B" },
  en_progreso: { label: "En progreso", bg: "rgba(37,99,235,0.1)",   text: "#2563EB" },
  completado:  { label: "Completado",  bg: "rgba(74,139,0,0.1)",    text: "#4A8B00" },
  pausado:     { label: "Pausado",     bg: "rgba(107,114,128,0.1)", text: "#6B7280" },
};

const FILTERS = ["Todos", "En progreso", "Completado", "Pausado", "Pendiente"];

function fmt(fecha?: string) {
  if (!fecha) return "—";
  return new Date(fecha).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ProyectosPage() {
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("Todos");

  useEffect(() => {
    getMisProyectos()
      .then(setProyectos)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = proyectos.filter((p) => {
    if (activeFilter === "Todos") return true;
    const estado = ESTADO_MAP[p.estado]?.label ?? p.estado;
    return estado === activeFilter;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem", fontFamily: "'Google Sans', system-ui" }}>
          Proyectos
        </h1>
        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontFamily: "'Outfit', sans-serif" }}>
          Gestiona y revisa el progreso de tus proyectos activos
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            style={{
              padding: "0.5rem 1.1rem", borderRadius: "999px",
              border: activeFilter === f ? "1.5px solid var(--verde)" : "1px solid var(--border)",
              background: activeFilter === f ? "rgba(74,139,0,0.08)" : "var(--bg)",
              color: activeFilter === f ? "var(--verde)" : "var(--text-secondary)",
              fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
              fontFamily: "'Outfit', sans-serif", transition: "all 0.2s ease",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontFamily: "'Outfit', sans-serif" }}>Cargando proyectos...</p>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div style={{ padding: "3rem", textAlign: "center", borderRadius: "16px", border: "1px dashed var(--border)" }}>
          <p style={{ color: "var(--text-muted)", fontFamily: "'Outfit', sans-serif" }}>No hay proyectos en esta categoria.</p>
        </div>
      )}

      {/* Project Grid */}
      {!loading && filtered.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1rem" }}>
          {filtered.map((proyecto) => {
            const sc = ESTADO_MAP[proyecto.estado] ?? ESTADO_MAP.pendiente;
            const progreso = proyecto.progreso ?? 0;
            const barColor = proyecto.estado === "completado" ? "#4A8B00" : proyecto.estado === "pausado" ? "#F59E0B" : "#2563EB";
            return (
              <div
                key={proyecto.id}
                style={{
                  background: "var(--bg)", border: "1px solid var(--border)",
                  borderRadius: "14px", padding: "1.4rem",
                  display: "flex", flexDirection: "column", gap: "0.9rem",
                  transition: "box-shadow 0.2s ease, border-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.06)";
                  (e.currentTarget as HTMLDivElement).style.borderColor = "var(--verde)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                  (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
                }}
              >
                {/* Top row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", fontFamily: "'Google Sans', system-ui", marginBottom: "0.2rem", lineHeight: 1.3 }}>
                      {proyecto.nombre}
                    </h3>
                    {proyecto.descripcion && (
                      <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontFamily: "'Outfit', sans-serif", margin: 0 }}>
                        {proyecto.descripcion}
                      </p>
                    )}
                  </div>
                  <span style={{
                    padding: "0.25rem 0.7rem", borderRadius: "999px",
                    fontSize: "0.7rem", fontWeight: 600,
                    background: sc.bg, color: sc.text, whiteSpace: "nowrap",
                    fontFamily: "'Outfit', sans-serif",
                  }}>
                    {sc.label}
                  </span>
                </div>

                {/* Progress bar */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "'Outfit', sans-serif" }}>Progreso</span>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-primary)", fontFamily: "'Outfit', sans-serif" }}>{progreso}%</span>
                  </div>
                  <div style={{ height: "6px", borderRadius: "999px", background: "var(--bg-soft)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${progreso}%`, borderRadius: "999px", background: barColor, transition: "width 0.5s ease" }} />
                  </div>
                </div>

                {/* Footer: fechaEntrega */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "0.75rem" }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "'Outfit', sans-serif" }}>
                    {proyecto.fechaEntrega ? `Entrega: ${fmt(proyecto.fechaEntrega)}` : "Sin fecha de entrega"}
                  </span>
                  <a
                    href={`/dashboard/avances?proyecto=${proyecto.id}`}
                    style={{
                      fontSize: "0.72rem", fontWeight: 600, color: "var(--verde)",
                      textDecoration: "none", fontFamily: "'Outfit', sans-serif",
                    }}
                  >
                    Ver avances →
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProyecto, getImplementacionesByProyecto } from "@/libs/api";
import LoadingSpinner from "@/components/shared/loading-spinner";

const COLUMNAS = [
  { key: "por_hacer",   label: "Por hacer",   color: "#6B7280", bg: "rgba(107,114,128,0.06)" },
  { key: "en_progreso", label: "En progreso", color: "#2563EB", bg: "rgba(37,99,235,0.06)"   },
  { key: "en_revision", label: "En revisión", color: "#F59E0B", bg: "rgba(245,158,11,0.06)"  },
  { key: "completado",  label: "Completado",  color: "#4A8B00", bg: "rgba(74,139,0,0.06)"    },
];

const PRIORIDADES: Record<string, { label: string; color: string }> = {
  baja:  { label: "Baja",  color: "#4A8B00" },
  media: { label: "Media", color: "#F59E0B" },
  alta:  { label: "Alta",  color: "#DC2626" },
};

const ESTADO_MAP: Record<string, { label: string; color: string }> = {
  pendiente:   { label: "Pendiente",   color: "#F59E0B" },
  en_progreso: { label: "En progreso", color: "#2563EB" },
  completado:  { label: "Completado",  color: "#4A8B00" },
  pausado:     { label: "Pausado",     color: "#6B7280" },
};

const AVATAR_COLORS = ["#4A8B00", "#0ea5e9", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4"];

function fmt(fecha?: string | null) {
  if (!fecha) return "—";
  return new Date(fecha).toLocaleDateString("es-PE", { day: "2-digit", month: "short" });
}

type Vista = "kanban" | "lista";

export default function ProyectoDetallePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [proyecto, setProyecto] = useState<any>(null);
  const [implementaciones, setImplementaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [vista, setVista] = useState<Vista>("kanban");

  const cargar = useCallback(async () => {
    try {
      const [proy, impls] = await Promise.all([
        getProyecto(id),
        getImplementacionesByProyecto(id),
      ]);
      setProyecto(proy);
      setImplementaciones(impls);
    } catch (e: any) {
      setError(e.message ?? "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  if (loading) return <LoadingSpinner text="Cargando proyecto..." />;
  if (error) return <div style={{ padding: "2rem", color: "#ef4444", fontSize: "0.85rem" }}>{error}</div>;

  const estadoInfo = proyecto ? (ESTADO_MAP[proyecto.estado] ?? { label: proyecto.estado, color: "#6B7280" }) : null;

  const VIEWS: { key: Vista; label: string; icon: string }[] = [
    { key: "kanban", label: "Kanban", icon: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" },
    { key: "lista",  label: "Lista",  icon: "M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "100%" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", flexWrap: "wrap" }}>
        <button
          onClick={() => router.push("/dashboard/proyectos")}
          style={{ background: "var(--bg-soft)", border: "1px solid var(--border)", borderRadius: "8px", padding: "0.4rem 0.7rem", cursor: "pointer", color: "var(--text-secondary)", fontSize: "0.8rem", marginTop: "2px" }}
        >
          ← Mis proyectos
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>{proyecto?.nombre}</h1>
            {estadoInfo && (
              <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "0.2rem 0.65rem", borderRadius: "999px", background: `${estadoInfo.color}18`, color: estadoInfo.color, border: `1px solid ${estadoInfo.color}` }}>
                {estadoInfo.label}
              </span>
            )}
          </div>
          {proyecto?.descripcion && (
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "0.3rem 0 0" }}>{proyecto.descripcion}</p>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginTop: "0.6rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1, minWidth: "160px" }}>
              <div style={{ flex: 1, height: "6px", borderRadius: "999px", background: "var(--bg-soft)" }}>
                <div style={{ height: "100%", width: `${proyecto?.progreso ?? 0}%`, borderRadius: "999px", background: "var(--verde)", transition: "width 0.4s" }} />
              </div>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--verde)" }}>{proyecto?.progreso ?? 0}%</span>
            </div>
            {proyecto?.fechaEntrega && (
              <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 13, height: 13, flexShrink: 0 }}>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Entrega: <strong>{fmt(proyecto.fechaEntrega)}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* View switcher */}
      <div style={{ display: "flex", gap: "0.35rem", background: "var(--bg-soft)", border: "1px solid var(--border)", borderRadius: "10px", padding: "4px", alignSelf: "flex-start" }}>
        {VIEWS.map((v) => (
          <button
            key={v.key}
            onClick={() => setVista(v.key)}
            style={{
              display: "flex", alignItems: "center", gap: "0.4rem",
              padding: "0.38rem 0.85rem", borderRadius: "7px", border: "none", cursor: "pointer",
              fontSize: "0.78rem", fontWeight: 600, transition: "all 0.15s",
              background: vista === v.key ? "var(--bg)" : "transparent",
              color: vista === v.key ? "var(--text-primary)" : "var(--text-muted)",
              boxShadow: vista === v.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: "14px", height: "14px", flexShrink: 0 }}>
              <path d={v.icon} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {v.label}
          </button>
        ))}
      </div>

      {/* Sin fases */}
      {implementaciones.length === 0 && (
        <div style={{ padding: "3rem", textAlign: "center", border: "1px dashed var(--border)", borderRadius: "14px" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>El equipo aún no ha creado fases para este proyecto. ¡Pronto habrá avances!</p>
        </div>
      )}

      {/* ── KANBAN VIEW ── */}
      {vista === "kanban" && implementaciones.map((impl) => {
        const tareasPorCol = COLUMNAS.reduce<Record<string, any[]>>((acc, col) => {
          acc[col.key] = (impl.tareas ?? []).filter((t: any) => t.columna === col.key)
            .sort((a: any, b: any) => a.orden - b.orden);
          return acc;
        }, {});
        const totalTareas = impl.tareas?.length ?? 0;
        const completadas = tareasPorCol["completado"]?.length ?? 0;
        const pct = totalTareas > 0 ? Math.round((completadas / totalTareas) * 100) : 0;

        return (
          <div key={impl.id} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden" }}>
            <div style={{ padding: "0.9rem 1.25rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)", flex: 1 }}>{impl.nombre}</span>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{completadas}/{totalTareas} tareas</span>
              <div style={{ width: "100px", height: "4px", borderRadius: "999px", background: "var(--bg-soft)" }}>
                <div style={{ height: "100%", width: `${pct}%`, borderRadius: "999px", background: "var(--verde)" }} />
              </div>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--verde)" }}>{pct}%</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", overflowX: "auto" }}>
              {COLUMNAS.map((col, colIdx) => {
                const tareas = tareasPorCol[col.key];
                return (
                  <div key={col.key} style={{
                    borderRight: colIdx < COLUMNAS.length - 1 ? "1px solid var(--border)" : "none",
                    padding: "1rem", minWidth: "180px", background: col.bg,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.75rem" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: col.color, flexShrink: 0 }} />
                      <span style={{ fontSize: "0.7rem", fontWeight: 700, color: col.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>{col.label}</span>
                      <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginLeft: "auto", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "999px", padding: "0 0.4rem" }}>{tareas.length}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                      {tareas.map((tarea: any) => {
                        const pri = PRIORIDADES[tarea.prioridad] ?? PRIORIDADES["media"];
                        return (
                          <div key={tarea.id} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "10px", padding: "0.7rem 0.85rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                            <span style={{ fontSize: "0.62rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: "999px", background: `${pri.color}18`, color: pri.color, textTransform: "uppercase", alignSelf: "flex-start" }}>
                              {pri.label}
                            </span>
                            <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)", margin: 0, lineHeight: 1.35 }}>{tarea.titulo}</p>
                            {tarea.descripcion && (
                              <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.4 }}>{tarea.descripcion}</p>
                            )}
                            {(tarea.responsables?.length > 0 || tarea.fechaLimite) && (
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.1rem" }}>
                                {tarea.responsables?.length > 0 ? (
                                  <div style={{ display: "flex" }}>
                                    {tarea.responsables.map((r: any, i: number) => {
                                      const bg = AVATAR_COLORS[r.nombre.charCodeAt(0) % AVATAR_COLORS.length];
                                      return (
                                        <div key={r.id} title={r.nombre} style={{
                                          width: 22, height: 22, borderRadius: "50%", background: bg,
                                          display: "flex", alignItems: "center", justifyContent: "center",
                                          fontSize: "0.58rem", fontWeight: 700, color: "#fff",
                                          border: "2px solid var(--bg)", marginLeft: i > 0 ? -6 : 0, flexShrink: 0,
                                        }}>
                                          {r.nombre.trim().charAt(0).toUpperCase()}
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : <span />}
                                {tarea.fechaLimite && (
                                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--text-muted)" }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 11, height: 11, flexShrink: 0 }}>
                                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                    <span style={{ fontSize: "0.65rem" }}>{fmt(tarea.fechaLimite)}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {tareas.length === 0 && (
                        <div style={{ padding: "0.75rem", textAlign: "center", borderRadius: "8px", border: "1px dashed var(--border)" }}>
                          <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", margin: 0 }}>Vacío</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* ── LISTA VIEW ── */}
      {vista === "lista" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {implementaciones.map((impl) => {
            const tareas: any[] = impl.tareas ?? [];
            if (tareas.length === 0) return null;

            const thStyle: React.CSSProperties = {
              padding: "0.5rem 0.75rem", textAlign: "left",
              fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)",
              textTransform: "uppercase", letterSpacing: "0.05em",
              whiteSpace: "nowrap", borderBottom: "1px solid var(--border)",
              background: "var(--bg-soft)",
            };
            const tdStyle: React.CSSProperties = {
              padding: "0.55rem 0.75rem", fontSize: "0.78rem",
              color: "var(--text-primary)", borderBottom: "1px solid var(--border)",
              verticalAlign: "middle",
            };

            return (
              <div key={impl.id} style={{ border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden" }}>
                <div style={{ padding: "0.7rem 1rem", background: "var(--bg-soft)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-primary)" }}>{impl.nombre}</span>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "999px", padding: "0.1rem 0.5rem" }}>
                    {tareas.length} tarea{tareas.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={thStyle}>Tarea</th>
                        <th style={thStyle}>Estado</th>
                        <th style={thStyle}>Prioridad</th>
                        <th style={thStyle}>Responsables</th>
                        <th style={thStyle}>Inicio</th>
                        <th style={thStyle}>Límite</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tareas.map((t: any, idx: number) => {
                        const col = COLUMNAS.find((c) => c.key === t.columna) ?? COLUMNAS[0];
                        const pri = PRIORIDADES[t.prioridad] ?? { label: t.prioridad, color: "#6B7280" };
                        const isLast = idx === tareas.length - 1;
                        return (
                          <tr key={t.id}
                            style={{ background: "var(--bg)", transition: "background 0.1s" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "var(--bg-soft)"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "var(--bg)"; }}
                          >
                            <td style={{ ...tdStyle, borderBottom: isLast ? "none" : tdStyle.borderBottom, maxWidth: "280px" }}>
                              <span style={{ fontWeight: 600 }}>{t.titulo}</span>
                              {t.descripcion && (
                                <p style={{ margin: "0.15rem 0 0", fontSize: "0.7rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "260px" }}>
                                  {t.descripcion}
                                </p>
                              )}
                            </td>
                            <td style={{ ...tdStyle, borderBottom: isLast ? "none" : tdStyle.borderBottom }}>
                              <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "0.2rem 0.55rem", borderRadius: "999px", background: `${col.color}18`, color: col.color, whiteSpace: "nowrap", border: `1px solid ${col.color}40` }}>
                                {col.label}
                              </span>
                            </td>
                            <td style={{ ...tdStyle, borderBottom: isLast ? "none" : tdStyle.borderBottom }}>
                              <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "0.2rem 0.55rem", borderRadius: "999px", background: `${pri.color}18`, color: pri.color, whiteSpace: "nowrap" }}>
                                {pri.label}
                              </span>
                            </td>
                            <td style={{ ...tdStyle, borderBottom: isLast ? "none" : tdStyle.borderBottom }}>
                              {t.responsables?.length > 0 ? (
                                <div style={{ display: "flex", alignItems: "center" }}>
                                  {t.responsables.slice(0, 3).map((r: any, i: number) => {
                                    const bg = AVATAR_COLORS[r.nombre.charCodeAt(0) % AVATAR_COLORS.length];
                                    return (
                                      <div key={r.id} title={r.nombre} style={{
                                        width: 22, height: 22, borderRadius: "50%", background: bg,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: "0.58rem", fontWeight: 700, color: "#fff",
                                        border: "2px solid var(--bg)", marginLeft: i > 0 ? -6 : 0,
                                      }}>
                                        {r.nombre.trim().charAt(0).toUpperCase()}
                                      </div>
                                    );
                                  })}
                                  {t.responsables.length > 3 && (
                                    <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginLeft: "4px" }}>+{t.responsables.length - 3}</span>
                                  )}
                                </div>
                              ) : <span style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>—</span>}
                            </td>
                            <td style={{ ...tdStyle, borderBottom: isLast ? "none" : tdStyle.borderBottom, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                              {fmt(t.fechaInicio)}
                            </td>
                            <td style={{ ...tdStyle, borderBottom: isLast ? "none" : tdStyle.borderBottom, whiteSpace: "nowrap" }}>
                              {t.fechaLimite ? (
                                <span style={{ color: new Date(t.fechaLimite) < new Date() && t.columna !== "completado" ? "#ef4444" : "var(--text-muted)" }}>
                                  {fmt(t.fechaLimite)}
                                </span>
                              ) : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

const COLUMNAS: Record<string, { label: string; color: string }> = {
  por_hacer:   { label: "Por hacer",   color: "#6B7280" },
  en_progreso: { label: "En progreso", color: "#2563EB" },
  en_revision: { label: "En revisión", color: "#F59E0B" },
  completado:  { label: "Completado",  color: "#4A8B00" },
};

const PRIORIDADES: Record<string, { label: string; color: string }> = {
  baja:  { label: "Baja",  color: "#4A8B00" },
  media: { label: "Media", color: "#F59E0B" },
  alta:  { label: "Alta",  color: "#DC2626" },
};

function fmt(fecha?: string | null) {
  if (!fecha) return "—";
  return new Date(fecha).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "2-digit" });
}

const AVATAR_COLORS = ["#4A8B00", "#0ea5e9", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4"];

interface ListaViewProps {
  implementaciones: any[];
  onEliminarTarea: (id: string) => void;
  onEditarTarea: (tarea: any) => void;
}

export default function ListaView({ implementaciones, onEliminarTarea, onEditarTarea }: ListaViewProps) {
  const totalTareas = implementaciones.reduce((sum, impl) => sum + (impl.tareas?.length ?? 0), 0);

  if (totalTareas === 0) {
    return (
      <div style={{ padding: "3rem", textAlign: "center", border: "1px dashed var(--border)", borderRadius: "14px" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>
          No hay tareas en este proyecto.
        </p>
      </div>
    );
  }

  const thStyle: React.CSSProperties = {
    padding: "0.5rem 0.75rem",
    textAlign: "left",
    fontSize: "0.68rem",
    fontWeight: 700,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    whiteSpace: "nowrap",
    borderBottom: "1px solid var(--border)",
    background: "var(--bg-soft)",
  };

  const tdStyle: React.CSSProperties = {
    padding: "0.55rem 0.75rem",
    fontSize: "0.78rem",
    color: "var(--text-primary)",
    borderBottom: "1px solid var(--border)",
    verticalAlign: "middle",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {implementaciones.map((impl) => {
        const tareas: any[] = impl.tareas ?? [];
        if (tareas.length === 0) return null;

        return (
          <div key={impl.id} style={{ border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden" }}>
            {/* Fase header */}
            <div style={{ padding: "0.7rem 1rem", background: "var(--bg-soft)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-primary)" }}>{impl.nombre}</span>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "999px", padding: "0.1rem 0.5rem" }}>
                {tareas.length} tarea{tareas.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Tabla */}
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
                    <th style={{ ...thStyle, textAlign: "right" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {tareas.map((t: any, idx: number) => {
                    const col = COLUMNAS[t.columna] ?? { label: t.columna, color: "#6B7280" };
                    const pri = PRIORIDADES[t.prioridad] ?? { label: t.prioridad, color: "#6B7280" };
                    const isLast = idx === tareas.length - 1;

                    return (
                      <tr key={t.id} style={{ background: "var(--bg)", transition: "background 0.1s" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "var(--bg-soft)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "var(--bg)"; }}
                      >
                        {/* Título */}
                        <td style={{ ...tdStyle, borderBottom: isLast ? "none" : tdStyle.borderBottom, maxWidth: "280px" }}>
                          <span style={{ fontWeight: 600 }}>{t.titulo}</span>
                          {t.descripcion && (
                            <p style={{ margin: "0.15rem 0 0", fontSize: "0.7rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "260px" }}>
                              {t.descripcion}
                            </p>
                          )}
                        </td>

                        {/* Estado */}
                        <td style={{ ...tdStyle, borderBottom: isLast ? "none" : tdStyle.borderBottom }}>
                          <span style={{
                            fontSize: "0.65rem", fontWeight: 700, padding: "0.2rem 0.55rem",
                            borderRadius: "999px", background: `${col.color}18`, color: col.color,
                            whiteSpace: "nowrap", border: `1px solid ${col.color}40`,
                          }}>
                            {col.label}
                          </span>
                        </td>

                        {/* Prioridad */}
                        <td style={{ ...tdStyle, borderBottom: isLast ? "none" : tdStyle.borderBottom }}>
                          <span style={{
                            fontSize: "0.65rem", fontWeight: 700, padding: "0.2rem 0.55rem",
                            borderRadius: "999px", background: `${pri.color}18`, color: pri.color,
                            whiteSpace: "nowrap",
                          }}>
                            {pri.label}
                          </span>
                        </td>

                        {/* Responsables */}
                        <td style={{ ...tdStyle, borderBottom: isLast ? "none" : tdStyle.borderBottom }}>
                          {t.responsables?.length > 0 ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                              <div style={{ display: "flex" }}>
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
                              </div>
                              {t.responsables.length > 3 && (
                                <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>+{t.responsables.length - 3}</span>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>—</span>
                          )}
                        </td>

                        {/* Fecha inicio */}
                        <td style={{ ...tdStyle, borderBottom: isLast ? "none" : tdStyle.borderBottom, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                          {fmt(t.fechaInicio)}
                        </td>

                        {/* Fecha límite */}
                        <td style={{ ...tdStyle, borderBottom: isLast ? "none" : tdStyle.borderBottom, whiteSpace: "nowrap" }}>
                          {t.fechaLimite ? (
                            <span style={{ color: new Date(t.fechaLimite) < new Date() && t.columna !== "completado" ? "#ef4444" : "var(--text-muted)" }}>
                              {fmt(t.fechaLimite)}
                            </span>
                          ) : "—"}
                        </td>

                        {/* Acciones */}
                        <td style={{ ...tdStyle, borderBottom: isLast ? "none" : tdStyle.borderBottom, textAlign: "right", whiteSpace: "nowrap" }}>
                          <button
                            onClick={() => onEditarTarea(t)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "0 4px", lineHeight: 1 }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--verde)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
                            title="Editar"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "13px", height: "13px" }}>
                              <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                          <button
                            onClick={() => onEliminarTarea(t.id)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "0 4px", lineHeight: 1 }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = "#ef4444"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
                            title="Eliminar"
                          >
                            ✕
                          </button>
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
  );
}

"use client";
// v2
import { useState } from "react";

const PRIORIDAD_COLOR: Record<string, string> = {
  baja:  "#4A8B00",
  media: "#F59E0B",
  alta:  "#DC2626",
};

const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

// Builds "YYYY-MM-DD" using LOCAL timezone (avoids UTC midnight shifting the day)
function localDateKey(dateStr: string): string {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

interface CalendarioViewProps {
  implementaciones: any[];
  onEditarTarea: (tarea: any) => void;
}

export default function CalendarioView({ implementaciones, onEditarTarea }: CalendarioViewProps) {
  const today = new Date();
  const [mes, setMes] = useState(today.getMonth());
  const [anio, setAnio] = useState(today.getFullYear());

  function prevMes() {
    if (mes === 0) { setMes(11); setAnio((a) => a - 1); }
    else setMes((m) => m - 1);
  }
  function nextMes() {
    if (mes === 11) { setMes(0); setAnio((a) => a + 1); }
    else setMes((m) => m + 1);
  }

  // Build map: "YYYY-MM-DD" (local) → tareas[]
  const tareasPorDia: Record<string, any[]> = {};
  for (const impl of implementaciones) {
    for (const t of (impl.tareas ?? [])) {
      if (t.fechaLimite) {
        const key = localDateKey(t.fechaLimite);
        if (!tareasPorDia[key]) tareasPorDia[key] = [];
        tareasPorDia[key].push({ ...t, faseName: impl.nombre });
      }
    }
  }

  // Calendar grid
  const firstDay = new Date(anio, mes, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(anio, mes + 1, 0).getDate();

  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Build cells: leading empty + days
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete the last row
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Nav */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <button
          onClick={prevMes}
          style={{ width: 30, height: 30, borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-soft)", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--verde)"; e.currentTarget.style.color = "var(--verde)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 13, height: 13 }}>
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)", minWidth: "160px", textAlign: "center" }}>
          {MESES[mes]} {anio}
        </span>

        <button
          onClick={nextMes}
          style={{ width: 30, height: 30, borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-soft)", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--verde)"; e.currentTarget.style.color = "var(--verde)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 13, height: 13 }}>
            <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <button
          onClick={() => { setMes(today.getMonth()); setAnio(today.getFullYear()); }}
          style={{ marginLeft: "0.5rem", padding: "0.3rem 0.75rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-soft)", cursor: "pointer", fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600 }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--verde)"; e.currentTarget.style.color = "var(--verde)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
        >
          Hoy
        </button>
      </div>

      {/* Calendar grid */}
      <div style={{ border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden" }}>
        {/* Day headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", background: "var(--bg-soft)", borderBottom: "1px solid var(--border)" }}>
          {DIAS.map((d) => (
            <div key={d} style={{ padding: "0.5rem 0", textAlign: "center", fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              {d}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {Array.from({ length: cells.length / 7 }, (_, wi) => (
          <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: wi < cells.length / 7 - 1 ? "1px solid var(--border)" : "none" }}>
            {cells.slice(wi * 7, wi * 7 + 7).map((day, di) => {
              const dateKey = day
                ? `${anio}-${String(mes + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                : null;
              const isToday = dateKey === todayKey;
              const tareas = dateKey ? (tareasPorDia[dateKey] ?? []) : [];

              return (
                <div
                  key={di}
                  style={{
                    borderRight: di < 6 ? "1px solid var(--border)" : "none",
                    minHeight: "80px",
                    padding: "0.4rem",
                    background: isToday ? "rgba(74,139,0,0.05)" : "var(--bg)",
                    position: "relative",
                  }}
                >
                  {day && (
                    <>
                      <span style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 22, height: 22, borderRadius: "50%",
                        fontSize: "0.72rem", fontWeight: isToday ? 800 : 500,
                        color: isToday ? "#fff" : "var(--text-primary)",
                        background: isToday ? "var(--verde)" : "transparent",
                        marginBottom: "0.3rem",
                      }}>
                        {day}
                      </span>

                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        {tareas.slice(0, 3).map((t: any) => {
                          const color = PRIORIDAD_COLOR[t.prioridad] ?? "#6B7280";
                          return (
                            <div
                              key={t.id}
                              title={`${t.titulo} · ${t.faseName}`}
                              onClick={() => onEditarTarea(t)}
                              style={{
                                fontSize: "0.62rem", fontWeight: 600,
                                padding: "0.15rem 0.35rem", borderRadius: "4px",
                                background: `${color}18`, color: color,
                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                cursor: "pointer",
                                borderLeft: `2px solid ${color}`,
                                transition: "background 0.1s",
                              }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = `${color}35`; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = `${color}18`; }}
                            >
                              {t.titulo}
                            </div>
                          );
                        })}
                        {tareas.length > 3 && (
                          <span style={{ fontSize: "0.6rem", color: "var(--text-muted)", paddingLeft: "0.2rem" }}>
                            +{tareas.length - 3} más
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 600 }}>Prioridad:</span>
        {[["baja", "Baja"], ["media", "Media"], ["alta", "Alta"]].map(([k, label]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <div style={{ width: 8, height: 8, borderRadius: "2px", background: PRIORIDAD_COLOR[k] }} />
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{label}</span>
          </div>
        ))}
        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginLeft: "0.5rem" }}>· Las fechas corresponden a la fecha límite de cada tarea</span>
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";

const PRIORIDAD_COLOR: Record<string, string> = {
  baja:  "#4A8B00",
  media: "#F59E0B",
  alta:  "#DC2626",
};

const COLUMNA_LABEL: Record<string, string> = {
  por_hacer:   "Por hacer",
  en_progreso: "En progreso",
  en_revision: "En revisión",
  completado:  "Completado",
};

function addDays(date: Date, n: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseLocalDate(str: string) {
  const [y, m, d] = str.split("T")[0].split("-").map(Number);
  return new Date(y, m - 1, d);
}

function fmtShort(date: Date) {
  return date.toLocaleDateString("es-PE", { day: "2-digit", month: "short" });
}

interface GanttViewProps {
  implementaciones: any[];
}

export default function GanttView({ implementaciones }: GanttViewProps) {
  // Collect all tasks with at least one date
  const rows: { tarea: any; faseName: string; start: Date | null; end: Date | null }[] = [];
  for (const impl of implementaciones) {
    for (const t of (impl.tareas ?? [])) {
      const start = t.fechaInicio ? parseLocalDate(t.fechaInicio) : null;
      const end   = t.fechaLimite ? parseLocalDate(t.fechaLimite) : null;
      if (start || end) {
        rows.push({ tarea: t, faseName: impl.nombre, start, end });
      }
    }
  }

  const noFechas = implementaciones.flatMap((impl) =>
    (impl.tareas ?? []).filter((t: any) => !t.fechaInicio && !t.fechaLimite).map((t: any) => ({ ...t, faseName: impl.nombre }))
  );

  // Compute date range
  const today = startOfDay(new Date());

  if (rows.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div style={{ padding: "3rem", textAlign: "center", border: "1px dashed var(--border)", borderRadius: "14px" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0 0 0.5rem" }}>
            Ninguna tarea tiene fechas asignadas.
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", margin: 0 }}>
            Asigna una <strong>Fecha inicio</strong> y/o <strong>Fecha límite</strong> a las tareas para visualizarlas aquí.
          </p>
        </div>
        {noFechas.length > 0 && <SinFechasTable tareas={noFechas} />}
      </div>
    );
  }

  const allDates: Date[] = [];
  for (const r of rows) {
    if (r.start) allDates.push(r.start);
    if (r.end)   allDates.push(r.end);
  }

  const minDate = startOfDay(new Date(Math.min(...allDates.map((d) => d.getTime()))));
  const maxDate = startOfDay(new Date(Math.max(...allDates.map((d) => d.getTime()))));

  // Pad left/right by a few days for visual breathing room
  const rangeStart = addDays(minDate, -3);
  const rangeEnd   = addDays(maxDate, 3);
  const totalDays  = Math.round((rangeEnd.getTime() - rangeStart.getTime()) / 86400000) + 1;

  function pct(date: Date) {
    const offset = Math.round((startOfDay(date).getTime() - rangeStart.getTime()) / 86400000);
    return (offset / totalDays) * 100;
  }

  const todayPct = pct(today);
  const showToday = todayPct >= 0 && todayPct <= 100;

  // Build header ticks — one per week approximately
  const tickDates: Date[] = [];
  let tick = new Date(rangeStart);
  while (tick <= rangeEnd) {
    tickDates.push(new Date(tick));
    tick = addDays(tick, 7);
  }

  const LABEL_W = 200;
  const BAR_AREA_MIN = 500;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden" }}>
        {/* Timeline header */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border)", background: "var(--bg-soft)" }}>
          <div style={{ width: LABEL_W, minWidth: LABEL_W, padding: "0.5rem 1rem", fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", borderRight: "1px solid var(--border)", flexShrink: 0 }}>
            Tarea
          </div>
          <div style={{ flex: 1, position: "relative", minWidth: BAR_AREA_MIN, overflow: "hidden" }}>
            {tickDates.map((d, i) => (
              <div key={i} style={{
                position: "absolute",
                left: `${pct(d)}%`,
                top: 0, bottom: 0,
                display: "flex", alignItems: "center",
                paddingLeft: "4px",
                fontSize: "0.62rem", color: "var(--text-muted)", fontWeight: 600,
                whiteSpace: "nowrap",
                pointerEvents: "none",
              }}>
                {fmtShort(d)}
              </div>
            ))}
            <div style={{ height: "30px" }} />
          </div>
        </div>

        {/* Rows */}
        {rows.map(({ tarea: t, faseName, start, end }, i) => {
          const color = PRIORIDAD_COLOR[t.prioridad] ?? "#6B7280";

          // Determine bar positioning
          let barLeft: number;
          let barWidth: number;

          if (start && end) {
            barLeft  = pct(start);
            barWidth = pct(end) - barLeft;
          } else if (start) {
            barLeft  = pct(start);
            barWidth = (1 / totalDays) * 100 * 1.5; // ~1.5 day width for milestone
          } else if (end) {
            barLeft  = pct(end) - (1 / totalDays) * 100 * 1.5;
            barWidth = (1 / totalDays) * 100 * 1.5;
          } else {
            return null;
          }

          const isMilestone = !start || !end;
          const isCompleted = t.columna === "completado";

          return (
            <div key={t.id} style={{ display: "flex", borderBottom: i < rows.length - 1 ? "1px solid var(--border)" : "none", background: i % 2 === 0 ? "var(--bg)" : "var(--bg-soft)" }}>
              {/* Label */}
              <div style={{ width: LABEL_W, minWidth: LABEL_W, padding: "0.5rem 1rem", borderRight: "1px solid var(--border)", flexShrink: 0 }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {t.titulo}
                </div>
                <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {faseName} · <span style={{ color: PRIORIDAD_COLOR[t.prioridad] ?? "#6B7280" }}>{t.prioridad}</span>
                </div>
              </div>

              {/* Bar area */}
              <div style={{ flex: 1, position: "relative", minWidth: BAR_AREA_MIN, overflow: "hidden", height: "44px" }}>
                {/* Today line */}
                {showToday && (
                  <div style={{
                    position: "absolute",
                    left: `${todayPct}%`,
                    top: 0, bottom: 0,
                    width: "1px",
                    background: "#ef4444",
                    opacity: 0.6,
                    zIndex: 2,
                    pointerEvents: "none",
                  }} />
                )}

                {/* Grid lines at tick dates */}
                {tickDates.map((d, ti) => (
                  <div key={ti} style={{
                    position: "absolute", left: `${pct(d)}%`, top: 0, bottom: 0,
                    width: "1px", background: "var(--border)", opacity: 0.5, pointerEvents: "none",
                  }} />
                ))}

                {/* Task bar */}
                <div
                  title={`${t.titulo}\n${COLUMNA_LABEL[t.columna] ?? t.columna}\n${start ? fmtShort(start) : "—"} → ${end ? fmtShort(end) : "—"}`}
                  style={{
                    position: "absolute",
                    left: `${Math.max(0, barLeft)}%`,
                    width: `${Math.max(barWidth, 0.8)}%`,
                    top: "50%",
                    transform: "translateY(-50%)",
                    height: isMilestone ? "12px" : "18px",
                    borderRadius: isMilestone ? "2px" : "4px",
                    background: isCompleted
                      ? `${color}55`
                      : `${color}cc`,
                    border: `1.5px solid ${color}`,
                    boxSizing: "border-box",
                    cursor: "default",
                    display: "flex", alignItems: "center",
                    paddingLeft: "5px",
                    overflow: "hidden",
                    zIndex: 1,
                  }}
                >
                  {!isMilestone && barWidth > 6 && (
                    <span style={{ fontSize: "0.58rem", fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {t.titulo}
                    </span>
                  )}
                  {isMilestone && (
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: color, flexShrink: 0 }} />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: "16px", height: "2px", background: "#ef4444", opacity: 0.6 }} />
          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Hoy</span>
        </div>
        {[["baja", "Baja"], ["media", "Media"], ["alta", "Alta"]].map(([k, label]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <div style={{ width: 10, height: 10, borderRadius: "2px", background: PRIORIDAD_COLOR[k] }} />
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{label}</span>
          </div>
        ))}
        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>· Barras más cortas = solo fecha límite (sin fecha inicio)</span>
      </div>

      {noFechas.length > 0 && <SinFechasTable tareas={noFechas} />}
    </div>
  );
}

function SinFechasTable({ tareas }: { tareas: any[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{ width: "100%", padding: "0.7rem 1rem", display: "flex", alignItems: "center", gap: "0.5rem", background: "var(--bg-soft)", border: "none", cursor: "pointer", textAlign: "left" }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          style={{ width: "12px", height: "12px", color: "var(--text-muted)", transition: "transform 0.2s", transform: open ? "rotate(0deg)" : "rotate(-90deg)", flexShrink: 0 }}>
          <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)" }}>
          Sin fechas ({tareas.length} tarea{tareas.length !== 1 ? "s" : ""})
        </span>
      </button>
      {open && (
        <div style={{ padding: "0.5rem 1rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          {tareas.map((t: any) => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: PRIORIDAD_COLOR[t.prioridad] ?? "#6B7280", flexShrink: 0 }} />
              <span style={{ color: "var(--text-primary)" }}>{t.titulo}</span>
              <span style={{ color: "var(--text-muted)" }}>· {t.faseName}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

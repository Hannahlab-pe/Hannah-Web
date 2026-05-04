"use client";

import { useState, useEffect } from "react";
import { getMisProyectos, getImplementacionesByProyecto } from "@/libs/api";
import LoadingSpinner from "@/components/shared/loading-spinner";

const COLUMNA_LABEL: Record<string, string> = {
  por_hacer:   "Por hacer",
  en_progreso: "En progreso",
  en_revision: "En revisión",
  completado:  "Completado",
};

const COLUMNA_COLOR: Record<string, string> = {
  por_hacer:   "#6B7280",
  en_progreso: "#2563EB",
  en_revision: "#F59E0B",
  completado:  "#4A8B00",
};

function fmt(fecha?: string | null) {
  if (!fecha) return null;
  return new Date(fecha).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
}

interface TareaEntry {
  id: string;
  titulo: string;
  descripcion?: string;
  columna: string;
  prioridad?: string;
  fechaLimite?: string;
  fechaInicio?: string;
  implementacionNombre: string;
  proyectoNombre: string;
}

export default function AvancesPage() {
  const [tareas, setTareas] = useState<TareaEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargar() {
      try {
        const proyectos = await getMisProyectos();
        const impls = await Promise.all(
          proyectos.map((p: any) =>
            getImplementacionesByProyecto(p.id).then((list: any[]) =>
              list.map((impl) => ({ ...impl, proyectoNombre: p.nombre }))
            )
          )
        );
        const todas: TareaEntry[] = impls.flat().flatMap((impl: any) =>
          (impl.tareas ?? []).map((t: any) => ({
            id: t.id,
            titulo: t.titulo,
            descripcion: t.descripcion,
            columna: t.columna,
            prioridad: t.prioridad,
            fechaLimite: t.fechaLimite,
            fechaInicio: t.fechaInicio,
            implementacionNombre: impl.nombre,
            proyectoNombre: impl.proyectoNombre,
          }))
        );
        todas.sort((a, b) => {
          const da = a.fechaLimite ? new Date(a.fechaLimite).getTime() : 0;
          const db = b.fechaLimite ? new Date(b.fechaLimite).getTime() : 0;
          return db - da;
        });
        setTareas(todas);
      } catch (e: any) {
        setError(e.message ?? "Error al cargar avances");
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, []);

  if (loading) return <LoadingSpinner text="Cargando avances..." />;
  if (error) return <div style={{ padding: "2rem", color: "#ef4444", fontSize: "0.85rem" }}>{error}</div>;

  const completadas = tareas.filter((t) => t.columna === "completado");
  const enCurso     = tareas.filter((t) => t.columna === "en_progreso" || t.columna === "en_revision");
  const pendientes  = tareas.filter((t) => t.columna === "por_hacer");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
          Avances
        </h1>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "0.25rem 0 0" }}>
          Estado actual de todas las tareas en tus proyectos
        </p>
      </div>

      {/* Resumen */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.85rem" }}>
        {[
          { label: "Completadas", count: completadas.length, color: "#4A8B00" },
          { label: "En curso",    count: enCurso.length,     color: "#2563EB" },
          { label: "Pendientes",  count: pendientes.length,  color: "#6B7280" },
          { label: "Total",       count: tareas.length,      color: "var(--verde)" },
        ].map((s) => (
          <div key={s.label} style={{
            background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "14px",
            padding: "1.1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.2rem",
          }}>
            <p style={{ fontSize: "1.8rem", fontWeight: 800, color: s.color, margin: 0, lineHeight: 1 }}>{s.count}</p>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {tareas.length === 0 ? (
        <div style={{ padding: "3rem", textAlign: "center", border: "1px dashed var(--border)", borderRadius: "14px" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>
            Aún no hay tareas en tus proyectos. El equipo estará actualizando el progreso aquí.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>

          {/* Timeline */}
          <h3 style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 0.5rem" }}>
            Todas las tareas
          </h3>

          <div style={{ position: "relative", paddingLeft: "1.75rem" }}>
            <div style={{
              position: "absolute", left: "7px", top: "8px", bottom: "8px",
              width: "2px", background: "var(--border)", borderRadius: "999px",
            }} />

            {tareas.map((t) => {
              const color = COLUMNA_COLOR[t.columna] ?? "#6B7280";
              return (
                <div key={t.id} style={{ position: "relative", paddingBottom: "0.85rem" }}>
                  <div style={{
                    position: "absolute", left: "-1.75rem", top: "1.2rem",
                    width: "14px", height: "14px", borderRadius: "50%",
                    background: color, border: "3px solid var(--bg)",
                    boxShadow: `0 0 0 2px ${color}33`, zIndex: 1,
                  }} />

                  <div style={{
                    background: "var(--bg)", border: "1px solid var(--border)",
                    borderRadius: "12px", padding: "0.9rem 1.1rem",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                  }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = color;
                      (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 16px rgba(0,0,0,0.06)`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", marginBottom: "0.4rem", flexWrap: "wrap" }}>
                      <span style={{
                        fontSize: "0.62rem", fontWeight: 700, padding: "0.15rem 0.55rem",
                        borderRadius: "999px", background: `${color}18`, color,
                        border: `1px solid ${color}40`,
                      }}>
                        {COLUMNA_LABEL[t.columna] ?? t.columna}
                      </span>
                      <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
                        {t.proyectoNombre} · {t.implementacionNombre}
                      </span>
                      {t.fechaLimite && (
                        <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginLeft: "auto" }}>
                          {fmt(t.fechaLimite)}
                        </span>
                      )}
                    </div>

                    <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)", margin: 0, lineHeight: 1.35 }}>
                      {t.titulo}
                    </p>
                    {t.descripcion && (
                      <p style={{ fontSize: "0.73rem", color: "var(--text-muted)", margin: "0.25rem 0 0", lineHeight: 1.45 }}>
                        {t.descripcion}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

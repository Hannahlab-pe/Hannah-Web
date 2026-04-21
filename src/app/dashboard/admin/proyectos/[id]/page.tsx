"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getProyecto,
  getImplementacionesByProyecto,
  crearImplementacion,
  eliminarImplementacion,
  crearTarea,
  moverTarea,
  eliminarTarea,
} from "@/libs/api";

// ── Constantes ────────────────────────────────────────────────────
const COLUMNAS = [
  { key: "por_hacer",   label: "Por hacer",    color: "#6B7280", bg: "rgba(107,114,128,0.07)" },
  { key: "en_progreso", label: "En progreso",  color: "#2563EB", bg: "rgba(37,99,235,0.07)"   },
  { key: "en_revision", label: "En revisión",  color: "#F59E0B", bg: "rgba(245,158,11,0.07)"  },
  { key: "completado",  label: "Completado",   color: "#4A8B00", bg: "rgba(74,139,0,0.07)"    },
];

const COL_KEYS = COLUMNAS.map((c) => c.key);

const PRIORIDADES = [
  { key: "baja",  label: "Baja",  color: "#4A8B00" },
  { key: "media", label: "Media", color: "#F59E0B" },
  { key: "alta",  label: "Alta",  color: "#DC2626" },
];

const TIPOS = [
  { key: "proyecto_web",   label: "Proyecto web" },
  { key: "automatizacion", label: "Automatización" },
  { key: "diseno_3d",      label: "Diseño 3D" },
  { key: "audiovisual",    label: "Audiovisual" },
  { key: "app_movil",      label: "App móvil" },
  { key: "otro",           label: "Otro" },
];

const ESTADO_MAP: Record<string, { label: string; color: string }> = {
  pendiente:   { label: "Pendiente",   color: "#F59E0B" },
  en_progreso: { label: "En progreso", color: "#2563EB" },
  completado:  { label: "Completado",  color: "#4A8B00" },
  pausado:     { label: "Pausado",     color: "#6B7280" },
};

function fmt(fecha?: string) {
  if (!fecha) return null;
  return new Date(fecha).toLocaleDateString("es-PE", { day: "2-digit", month: "short" });
}

// ── Componente tarjeta tarea ──────────────────────────────────────
function TareaCard({
  tarea,
  colIdx,
  onMover,
  onEliminar,
}: {
  tarea: any;
  colIdx: number;
  onMover: (id: string, col: string) => void;
  onEliminar: (id: string) => void;
}) {
  const pri = PRIORIDADES.find((p) => p.key === tarea.prioridad) ?? PRIORIDADES[1];
  return (
    <div
      style={{
        background: "var(--bg)",
        border: "1px solid var(--border)",
        borderRadius: "10px",
        padding: "0.7rem 0.85rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.45rem",
        transition: "box-shadow 0.15s",
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 10px rgba(0,0,0,0.08)")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.boxShadow = "none")}
    >
      {/* Prioridad + delete */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span
          style={{
            fontSize: "0.62rem", fontWeight: 700, padding: "0.15rem 0.5rem",
            borderRadius: "999px", background: `${pri.color}18`, color: pri.color,
            textTransform: "uppercase", letterSpacing: "0.04em",
          }}
        >
          {pri.label}
        </span>
        <button
          onClick={() => onEliminar(tarea.id)}
          title="Eliminar tarea"
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "0.75rem", lineHeight: 1, padding: "0 2px" }}
        >
          ✕
        </button>
      </div>

      {/* Título */}
      <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)", margin: 0, lineHeight: 1.35 }}>
        {tarea.titulo}
      </p>

      {/* Descripción */}
      {tarea.descripcion && (
        <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.4 }}>
          {tarea.descripcion}
        </p>
      )}

      {/* Fecha límite */}
      {tarea.fechaLimite && (
        <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", margin: 0 }}>
          📅 {fmt(tarea.fechaLimite)}
        </p>
      )}

      {/* Botones mover */}
      <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.15rem" }}>
        {colIdx > 0 && (
          <button
            onClick={() => onMover(tarea.id, COL_KEYS[colIdx - 1])}
            style={{
              flex: 1, fontSize: "0.68rem", padding: "0.25rem", borderRadius: "6px",
              border: "1px solid var(--border)", background: "var(--bg-soft)",
              cursor: "pointer", color: "var(--text-secondary)", fontWeight: 500,
            }}
          >
            ← {COLUMNAS[colIdx - 1].label}
          </button>
        )}
        {colIdx < COLUMNAS.length - 1 && (
          <button
            onClick={() => onMover(tarea.id, COL_KEYS[colIdx + 1])}
            style={{
              flex: 1, fontSize: "0.68rem", padding: "0.25rem", borderRadius: "6px",
              border: "none", background: COLUMNAS[colIdx + 1].color,
              cursor: "pointer", color: "#fff", fontWeight: 600,
            }}
          >
            {COLUMNAS[colIdx + 1].label} →
          </button>
        )}
      </div>
    </div>
  );
}

// ── Formulario inline nueva tarea ─────────────────────────────────
function NuevaTareaForm({
  implementacionId,
  onCreada,
  onCancel,
}: {
  implementacionId: string;
  onCreada: () => void;
  onCancel: () => void;
}) {
  const [titulo, setTitulo] = useState("");
  const [prioridad, setPrioridad] = useState("media");
  const [columna, setColumna] = useState("por_hacer");
  const [fechaLimite, setFechaLimite] = useState("");
  const [loading, setLoading] = useState(false);

  const inputS = {
    padding: "0.4rem 0.6rem", borderRadius: "7px", fontSize: "0.78rem",
    border: "1px solid var(--border)", background: "var(--bg-soft)",
    color: "var(--text-primary)", outline: "none", width: "100%", boxSizing: "border-box" as const,
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim()) return;
    setLoading(true);
    try {
      await crearTarea({ titulo: titulo.trim(), prioridad, columna, fechaLimite: fechaLimite || undefined, implementacionId });
      onCreada();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "var(--bg-soft)", border: "1px solid var(--border)", borderRadius: "12px",
        padding: "1rem", display: "flex", flexDirection: "column", gap: "0.65rem",
      }}
    >
      <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", margin: 0 }}>Nueva tarea</p>
      <input required placeholder="Título de la tarea..." value={titulo} onChange={(e) => setTitulo(e.target.value)} style={inputS} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <label style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 600 }}>Columna</label>
          <select value={columna} onChange={(e) => setColumna(e.target.value)} style={inputS}>
            {COLUMNAS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <label style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 600 }}>Prioridad</label>
          <select value={prioridad} onChange={(e) => setPrioridad(e.target.value)} style={inputS}>
            {PRIORIDADES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <label style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 600 }}>Fecha límite</label>
          <input type="date" value={fechaLimite} onChange={(e) => setFechaLimite(e.target.value)} style={inputS} />
        </div>
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button type="button" onClick={onCancel} style={{ flex: 1, padding: "0.4rem", borderRadius: "7px", border: "1px solid var(--border)", background: "transparent", cursor: "pointer", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
          Cancelar
        </button>
        <button type="submit" disabled={loading} style={{ flex: 2, padding: "0.4rem", borderRadius: "7px", border: "none", background: "var(--verde)", color: "#fff", cursor: loading ? "wait" : "pointer", fontSize: "0.75rem", fontWeight: 600 }}>
          {loading ? "Guardando..." : "Agregar tarea"}
        </button>
      </div>
    </form>
  );
}

// ── Página principal ─────────────────────────────────────────────
export default function KanbanAdminPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [proyecto, setProyecto] = useState<any>(null);
  const [implementaciones, setImplementaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal nueva fase
  const [modalFase, setModalFase] = useState(false);
  const [nuevaFaseNombre, setNuevaFaseNombre] = useState("");
  const [nuevaFaseTipo, setNuevaFaseTipo] = useState("otro");
  const [nuevaFaseLoading, setNuevaFaseLoading] = useState(false);

  // Formulario nueva tarea (por implementacion)
  const [formTareaOpen, setFormTareaOpen] = useState<string | null>(null);

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

  async function handleCrearFase(e: React.FormEvent) {
    e.preventDefault();
    if (!nuevaFaseNombre.trim()) return;
    setNuevaFaseLoading(true);
    try {
      await crearImplementacion({ nombre: nuevaFaseNombre.trim(), tipo: nuevaFaseTipo, proyectoId: id });
      setModalFase(false);
      setNuevaFaseNombre("");
      setNuevaFaseTipo("otro");
      cargar();
    } finally {
      setNuevaFaseLoading(false);
    }
  }

  async function handleEliminarFase(implId: string) {
    if (!confirm("¿Eliminar esta fase y todas sus tareas?")) return;
    try {
      await eliminarImplementacion(implId);
      cargar();
    } catch {}
  }

  async function handleMoverTarea(tareaId: string, columna: string) {
    try {
      await moverTarea(tareaId, columna);
      setImplementaciones((prev) =>
        prev.map((impl) => ({
          ...impl,
          tareas: impl.tareas.map((t: any) =>
            t.id === tareaId ? { ...t, columna } : t
          ),
        }))
      );
    } catch {}
  }

  async function handleEliminarTarea(tareaId: string) {
    if (!confirm("¿Eliminar esta tarea?")) return;
    try {
      await eliminarTarea(tareaId);
      setImplementaciones((prev) =>
        prev.map((impl) => ({
          ...impl,
          tareas: impl.tareas.filter((t: any) => t.id !== tareaId),
        }))
      );
    } catch {}
  }

  const inputS = {
    padding: "0.5rem 0.75rem", borderRadius: "8px", fontSize: "0.8rem",
    border: "1px solid var(--border)", background: "var(--bg-soft)",
    color: "var(--text-primary)", outline: "none", width: "100%", boxSizing: "border-box" as const,
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px" }}>
      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Cargando kanban...</p>
    </div>
  );

  if (error) return (
    <div style={{ padding: "2rem", color: "#ef4444", fontSize: "0.85rem" }}>{error}</div>
  );

  const estadoInfo = proyecto ? (ESTADO_MAP[proyecto.estado] ?? { label: proyecto.estado, color: "#6B7280" }) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "100%" }}>

      {/* ── Header del proyecto ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
          <button
            onClick={() => router.push("/dashboard/admin/proyectos")}
            style={{ background: "var(--bg-soft)", border: "1px solid var(--border)", borderRadius: "8px", padding: "0.4rem 0.7rem", cursor: "pointer", color: "var(--text-secondary)", fontSize: "0.8rem", marginTop: "2px" }}
          >
            ← Volver
          </button>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
              <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                {proyecto?.nombre}
              </h1>
              {estadoInfo && (
                <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "0.2rem 0.65rem", borderRadius: "999px", background: `${estadoInfo.color}18`, color: estadoInfo.color, border: `1px solid ${estadoInfo.color}` }}>
                  {estadoInfo.label}
                </span>
              )}
            </div>
            {proyecto?.cliente && (
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: "0.2rem 0 0" }}>
                Cliente: <strong style={{ color: "var(--text-secondary)" }}>{proyecto.cliente.nombre}</strong>
                {proyecto.cliente.empresa && ` · ${proyecto.cliente.empresa}`}
              </p>
            )}
            {proyecto?.encargados?.length > 0 && (
              <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: "0.2rem 0 0" }}>
                Equipo: {proyecto.encargados.map((e: any) => e.nombre).join(", ")}
              </p>
            )}
          </div>
        </div>

        {/* Progreso */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: "200px" }}>
          <div style={{ flex: 1, height: "6px", borderRadius: "999px", background: "var(--bg-soft)" }}>
            <div style={{ height: "100%", width: `${proyecto?.progreso ?? 0}%`, borderRadius: "999px", background: "var(--verde)", transition: "width 0.4s" }} />
          </div>
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--verde)", whiteSpace: "nowrap" }}>{proyecto?.progreso ?? 0}%</span>
        </div>
      </div>

      {/* ── Fases / Implementaciones ── */}
      {implementaciones.length === 0 && (
        <div style={{ padding: "3rem", textAlign: "center", border: "1px dashed var(--border)", borderRadius: "14px" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0 0 1rem" }}>
            Aún no hay fases en este proyecto. Crea la primera para empezar.
          </p>
          <button
            onClick={() => setModalFase(true)}
            style={{ padding: "0.55rem 1.2rem", borderRadius: "10px", background: "var(--verde)", border: "none", color: "#fff", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer" }}
          >
            + Nueva fase
          </button>
        </div>
      )}

      {implementaciones.map((impl) => {
        const tareasPorCol = COLUMNAS.reduce<Record<string, any[]>>((acc, col) => {
          acc[col.key] = (impl.tareas ?? []).filter((t: any) => t.columna === col.key)
            .sort((a: any, b: any) => a.orden - b.orden);
          return acc;
        }, {});

        const totalTareas = impl.tareas?.length ?? 0;
        const completadas = tareasPorCol["completado"]?.length ?? 0;
        const pctFase = totalTareas > 0 ? Math.round((completadas / totalTareas) * 100) : 0;

        return (
          <div
            key={impl.id}
            style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden" }}
          >
            {/* Header fase */}
            <div style={{ padding: "0.9rem 1.25rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)" }}>{impl.nombre}</span>
                <span style={{ fontSize: "0.65rem", fontWeight: 600, padding: "0.15rem 0.5rem", borderRadius: "999px", background: "var(--bg-soft)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                  {TIPOS.find((t) => t.key === impl.tipo)?.label ?? impl.tipo}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                  {completadas}/{totalTareas} tareas · {pctFase}%
                </span>
                <div style={{ width: "80px", height: "4px", borderRadius: "999px", background: "var(--bg-soft)" }}>
                  <div style={{ height: "100%", width: `${pctFase}%`, borderRadius: "999px", background: "var(--verde)" }} />
                </div>
                <button
                  onClick={() => setFormTareaOpen(formTareaOpen === impl.id ? null : impl.id)}
                  style={{ padding: "0.3rem 0.75rem", borderRadius: "7px", border: "none", background: "var(--verde)", color: "#fff", fontWeight: 600, fontSize: "0.72rem", cursor: "pointer" }}
                >
                  + Tarea
                </button>
                <button
                  onClick={() => handleEliminarFase(impl.id)}
                  title="Eliminar fase"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "0.85rem" }}
                >
                  🗑
                </button>
              </div>
            </div>

            {/* Form nueva tarea */}
            {formTareaOpen === impl.id && (
              <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)" }}>
                <NuevaTareaForm
                  implementacionId={impl.id}
                  onCreada={() => { setFormTareaOpen(null); cargar(); }}
                  onCancel={() => setFormTareaOpen(null)}
                />
              </div>
            )}

            {/* Tablero kanban */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0", overflowX: "auto" }}>
              {COLUMNAS.map((col, colIdx) => {
                const tareas = tareasPorCol[col.key];
                return (
                  <div
                    key={col.key}
                    style={{
                      borderRight: colIdx < COLUMNAS.length - 1 ? "1px solid var(--border)" : "none",
                      padding: "1rem",
                      minWidth: "200px",
                      background: col.bg,
                    }}
                  >
                    {/* Cabecera columna */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.75rem" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: col.color, flexShrink: 0 }} />
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, color: col.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>{col.label}</span>
                      <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginLeft: "auto", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "999px", padding: "0 0.4rem" }}>{tareas.length}</span>
                    </div>

                    {/* Tarjetas */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                      {tareas.map((tarea) => (
                        <TareaCard
                          key={tarea.id}
                          tarea={tarea}
                          colIdx={colIdx}
                          onMover={handleMoverTarea}
                          onEliminar={handleEliminarTarea}
                        />
                      ))}
                      {tareas.length === 0 && (
                        <div style={{ padding: "1rem 0.5rem", textAlign: "center", borderRadius: "8px", border: "1px dashed var(--border)" }}>
                          <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", margin: 0 }}>Vacío</p>
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

      {/* Botón agregar fase (cuando ya hay fases) */}
      {implementaciones.length > 0 && (
        <button
          onClick={() => setModalFase(true)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
            padding: "0.7rem", borderRadius: "12px", border: "1.5px dashed var(--border)",
            background: "transparent", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--verde)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--verde)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)"; }}
        >
          + Agregar nueva fase
        </button>
      )}

      {/* ── Modal nueva fase ── */}
      {modalFase && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={(e) => { if (e.target === e.currentTarget) setModalFase(false); }}
        >
          <div style={{ background: "var(--bg)", borderRadius: "16px", padding: "2rem", width: "100%", maxWidth: "440px", border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Nueva fase</h2>
              <button onClick={() => setModalFase(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "1.2rem" }}>✕</button>
            </div>
            <form onSubmit={handleCrearFase} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>Nombre <span style={{ color: "#ef4444" }}>*</span></label>
                <input required placeholder="Ej: Diseño UI, Desarrollo backend..." value={nuevaFaseNombre} onChange={(e) => setNuevaFaseNombre(e.target.value)} style={inputS} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>Tipo</label>
                <select value={nuevaFaseTipo} onChange={(e) => setNuevaFaseTipo(e.target.value)} style={inputS}>
                  {TIPOS.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
                <button type="button" onClick={() => setModalFase(false)} style={{ flex: 1, padding: "0.55rem", borderRadius: "8px", border: "1px solid var(--border)", background: "transparent", cursor: "pointer", fontSize: "0.8rem", color: "var(--text-secondary)" }}>Cancelar</button>
                <button type="submit" disabled={nuevaFaseLoading} style={{ flex: 2, padding: "0.55rem", borderRadius: "8px", border: "none", background: "var(--verde)", color: "#fff", fontWeight: 600, fontSize: "0.8rem", cursor: nuevaFaseLoading ? "wait" : "pointer" }}>
                  {nuevaFaseLoading ? "Creando..." : "Crear fase"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback, Fragment } from "react";
import { useParams, useRouter } from "next/navigation";
import { Dialog, Transition } from "@headlessui/react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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

// ── Componente tarjeta tarea (draggable) ──────────────────────────
function TareaCard({
  tarea,
  onEliminar,
  isDragOverlay = false,
}: {
  tarea: any;
  onEliminar?: (id: string) => void;
  isDragOverlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: tarea.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    cursor: isDragOverlay ? "grabbing" : "grab",
    background: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    padding: "0.7rem 0.85rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.45rem",
    boxShadow: isDragOverlay ? "0 8px 24px rgba(0,0,0,0.18)" : undefined,
  };

  const pri = PRIORIDADES.find((p) => p.key === tarea.prioridad) ?? PRIORIDADES[1];

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
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
        {!isDragOverlay && onEliminar && (
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onEliminar(tarea.id); }}
            title="Eliminar tarea"
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "0.75rem", lineHeight: 1, padding: "0 2px" }}
          >
            ✕
          </button>
        )}
      </div>

      <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)", margin: 0, lineHeight: 1.35 }}>
        {tarea.titulo}
      </p>

      {tarea.descripcion && (
        <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.4 }}>
          {tarea.descripcion}
        </p>
      )}

      {tarea.fechaLimite && (
        <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", margin: 0 }}>
          📅 {fmt(tarea.fechaLimite)}
        </p>
      )}
    </div>
  );
}

// ── Modal genérico Headless UI ────────────────────────────────────
function AppModal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" style={{ position: "relative", zIndex: 60 }} onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)" }} />
        </Transition.Child>

        <div style={{ position: "fixed", inset: 0, overflowY: "auto" }}>
          <div style={{ display: "flex", minHeight: "100%", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                style={{
                  width: "100%",
                  maxWidth: "460px",
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "16px",
                  padding: "1.75rem",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                  <Dialog.Title style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                    {title}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "1.1rem", lineHeight: 1 }}
                  >
                    ✕
                  </button>
                </div>
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
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

  // ── Modal nueva fase ──
  const [modalFase, setModalFase] = useState(false);
  const [faseFrm, setFaseFrm] = useState({ nombre: "", tipo: "otro" });
  const [faseLoading, setFaseLoading] = useState(false);

  // ── Modal nueva tarea ──
  const [modalTarea, setModalTarea] = useState(false);
  const [tareaCtx, setTareaCtx] = useState<{ implId: string; colKey: string } | null>(null);
  const [tareaFrm, setTareaFrm] = useState({ titulo: "", descripcion: "", prioridad: "media", fechaLimite: "" });
  const [tareaLoading, setTareaLoading] = useState(false);

  // ── Drag & Drop ──
  const [activeTarea, setActiveTarea] = useState<any>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

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

  // helpers DnD
  function findColKey(tareaId: string): string | null {
    for (const impl of implementaciones) {
      const t = impl.tareas?.find((t: any) => t.id === tareaId);
      if (t) return t.columna;
    }
    return null;
  }

  function handleDragStart(event: DragStartEvent) {
    const tareaId = event.active.id as string;
    for (const impl of implementaciones) {
      const t = impl.tareas?.find((t: any) => t.id === tareaId);
      if (t) { setActiveTarea(t); break; }
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const tareaId = active.id as string;
    const overId = over.id as string;

    // "over" puede ser un colKey o un tareaId
    const targetCol = COL_KEYS.includes(overId)
      ? overId
      : findColKey(overId);

    if (!targetCol) return;
    if (findColKey(tareaId) === targetCol) return;

    setImplementaciones((prev) =>
      prev.map((impl) => ({
        ...impl,
        tareas: impl.tareas?.map((t: any) =>
          t.id === tareaId ? { ...t, columna: targetCol } : t
        ),
      }))
    );
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTarea(null);
    if (!over) return;

    const tareaId = active.id as string;
    const overId = over.id as string;
    const targetCol = COL_KEYS.includes(overId) ? overId : findColKey(overId);
    if (!targetCol) return;

    try {
      await moverTarea(tareaId, targetCol);
    } catch {
      cargar(); // revert on error
    }
  }

  // ── Handlers fases ──
  async function handleCrearFase(e: React.FormEvent) {
    e.preventDefault();
    if (!faseFrm.nombre.trim()) return;
    setFaseLoading(true);
    try {
      await crearImplementacion({ nombre: faseFrm.nombre.trim(), tipo: faseFrm.tipo, proyectoId: id });
      setModalFase(false);
      setFaseFrm({ nombre: "", tipo: "otro" });
      cargar();
    } finally {
      setFaseLoading(false);
    }
  }

  async function handleEliminarFase(implId: string) {
    if (!confirm("¿Eliminar esta fase y todas sus tareas?")) return;
    try { await eliminarImplementacion(implId); cargar(); } catch {}
  }

  // ── Handlers tareas ──
  function abrirModalTarea(implId: string, colKey: string) {
    setTareaCtx({ implId, colKey });
    setTareaFrm({ titulo: "", descripcion: "", prioridad: "media", fechaLimite: "" });
    setModalTarea(true);
  }

  async function handleCrearTarea(e: React.FormEvent) {
    e.preventDefault();
    if (!tareaFrm.titulo.trim() || !tareaCtx) return;
    setTareaLoading(true);
    try {
      await crearTarea({
        titulo: tareaFrm.titulo.trim(),
        descripcion: tareaFrm.descripcion || undefined,
        prioridad: tareaFrm.prioridad,
        columna: tareaCtx.colKey,
        fechaLimite: tareaFrm.fechaLimite || undefined,
        implementacionId: tareaCtx.implId,
      });
      setModalTarea(false);
      cargar();
    } finally {
      setTareaLoading(false);
    }
  }

  async function handleEliminarTarea(tareaId: string) {
    if (!confirm("¿Eliminar esta tarea?")) return;
    try {
      await eliminarTarea(tareaId);
      setImplementaciones((prev) =>
        prev.map((impl) => ({
          ...impl,
          tareas: impl.tareas?.filter((t: any) => t.id !== tareaId),
        }))
      );
    } catch {}
  }

  const inputS: React.CSSProperties = {
    padding: "0.5rem 0.75rem", borderRadius: "8px", fontSize: "0.8rem",
    border: "1px solid var(--border)", background: "var(--bg-soft)",
    color: "var(--text-primary)", outline: "none", width: "100%", boxSizing: "border-box",
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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
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

        {/* ── Sin fases ── */}
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

        {/* ── Fases ── */}
        {implementaciones.map((impl) => {
          const tareasPorCol = COLUMNAS.reduce<Record<string, any[]>>((acc, col) => {
            acc[col.key] = (impl.tareas ?? [])
              .filter((t: any) => t.columna === col.key)
              .sort((a: any, b: any) => a.orden - b.orden);
            return acc;
          }, {});

          const totalTareas = impl.tareas?.length ?? 0;
          const completadas = tareasPorCol["completado"]?.length ?? 0;
          const pctFase = totalTareas > 0 ? Math.round((completadas / totalTareas) * 100) : 0;

          return (
            <div key={impl.id} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden" }}>
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
                    onClick={() => handleEliminarFase(impl.id)}
                    title="Eliminar fase"
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "0.85rem" }}
                  >
                    🗑
                  </button>
                </div>
              </div>

              {/* Tablero kanban */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, overflowX: "auto" }}>
                {COLUMNAS.map((col, colIdx) => {
                  const tareas = tareasPorCol[col.key];
                  const tareaIds = tareas.map((t: any) => t.id);
                  return (
                    <SortableContext key={col.key} id={col.key} items={tareaIds} strategy={verticalListSortingStrategy}>
                      <div
                        style={{
                          borderRight: colIdx < COLUMNAS.length - 1 ? "1px solid var(--border)" : "none",
                          padding: "1rem",
                          minWidth: "200px",
                          background: col.bg,
                          minHeight: "160px",
                        }}
                      >
                        {/* Cabecera columna */}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.75rem" }}>
                          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: col.color, flexShrink: 0 }} />
                          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: col.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            {col.label}
                          </span>
                          <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginLeft: "auto", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "999px", padding: "0 0.4rem" }}>
                            {tareas.length}
                          </span>
                        </div>

                        {/* Tarjetas */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                          {tareas.map((tarea: any) => (
                            <TareaCard key={tarea.id} tarea={tarea} onEliminar={handleEliminarTarea} />
                          ))}
                          {tareas.length === 0 && (
                            <div style={{ padding: "1rem 0.5rem", textAlign: "center", borderRadius: "8px", border: "1px dashed var(--border)" }}>
                              <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", margin: 0 }}>Arrastra aquí</p>
                            </div>
                          )}
                        </div>

                        {/* Botón agregar tarea en columna */}
                        <button
                          onClick={() => abrirModalTarea(impl.id, col.key)}
                          style={{
                            marginTop: "0.6rem", width: "100%", padding: "0.4rem", borderRadius: "7px",
                            border: "1px dashed var(--border)", background: "transparent",
                            color: "var(--text-muted)", fontSize: "0.72rem", cursor: "pointer",
                            fontWeight: 500, transition: "all 0.15s",
                          }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = col.color; (e.currentTarget as HTMLButtonElement).style.color = col.color; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)"; }}
                        >
                          + Agregar tarea
                        </button>
                      </div>
                    </SortableContext>
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
      </div>

      {/* ── DragOverlay ── */}
      <DragOverlay>
        {activeTarea ? <TareaCard tarea={activeTarea} isDragOverlay /> : null}
      </DragOverlay>

      {/* ── Modal nueva fase ── */}
      <AppModal open={modalFase} onClose={() => setModalFase(false)} title="Nueva fase">
        <form onSubmit={handleCrearFase} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>
              Nombre <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              required
              placeholder="Ej: Diseño UI, Desarrollo backend..."
              value={faseFrm.nombre}
              onChange={(e) => setFaseFrm((p) => ({ ...p, nombre: e.target.value }))}
              style={inputS}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>Tipo</label>
            <select value={faseFrm.tipo} onChange={(e) => setFaseFrm((p) => ({ ...p, tipo: e.target.value }))} style={inputS}>
              {TIPOS.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
            <button type="button" onClick={() => setModalFase(false)} style={{ flex: 1, padding: "0.55rem", borderRadius: "8px", border: "1px solid var(--border)", background: "transparent", cursor: "pointer", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              Cancelar
            </button>
            <button type="submit" disabled={faseLoading} style={{ flex: 2, padding: "0.55rem", borderRadius: "8px", border: "none", background: "var(--verde)", color: "#fff", fontWeight: 600, fontSize: "0.8rem", cursor: faseLoading ? "wait" : "pointer" }}>
              {faseLoading ? "Creando..." : "Crear fase"}
            </button>
          </div>
        </form>
      </AppModal>

      {/* ── Modal nueva tarea ── */}
      <AppModal open={modalTarea} onClose={() => setModalTarea(false)} title={`Nueva tarea · ${COLUMNAS.find((c) => c.key === tareaCtx?.colKey)?.label ?? ""}`}>
        <form onSubmit={handleCrearTarea} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>
              Título <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              required
              placeholder="Título de la tarea..."
              value={tareaFrm.titulo}
              onChange={(e) => setTareaFrm((p) => ({ ...p, titulo: e.target.value }))}
              style={inputS}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>Descripción</label>
            <textarea
              placeholder="Descripción opcional..."
              value={tareaFrm.descripcion}
              onChange={(e) => setTareaFrm((p) => ({ ...p, descripcion: e.target.value }))}
              rows={2}
              style={{ ...inputS, resize: "vertical" }}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>Prioridad</label>
              <select value={tareaFrm.prioridad} onChange={(e) => setTareaFrm((p) => ({ ...p, prioridad: e.target.value }))} style={inputS}>
                {PRIORIDADES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>Fecha límite</label>
              <input
                type="date"
                value={tareaFrm.fechaLimite}
                onChange={(e) => setTareaFrm((p) => ({ ...p, fechaLimite: e.target.value }))}
                style={inputS}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
            <button type="button" onClick={() => setModalTarea(false)} style={{ flex: 1, padding: "0.55rem", borderRadius: "8px", border: "1px solid var(--border)", background: "transparent", cursor: "pointer", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              Cancelar
            </button>
            <button type="submit" disabled={tareaLoading} style={{ flex: 2, padding: "0.55rem", borderRadius: "8px", border: "none", background: "var(--verde)", color: "#fff", fontWeight: 600, fontSize: "0.8rem", cursor: tareaLoading ? "wait" : "pointer" }}>
              {tareaLoading ? "Guardando..." : "Agregar tarea"}
            </button>
          </div>
        </form>
      </AppModal>
    </DndContext>
  );
}

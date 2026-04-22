"use client";

import { useState, useEffect, useCallback, useRef, Fragment } from "react";
import { useParams, useRouter } from "next/navigation";
import { Dialog, Transition } from "@headlessui/react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
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
  actualizarTarea,
  moverTarea,
  eliminarTarea,
  actualizarProyecto,
  getClientes,
} from "@/libs/api";
import LoadingSpinner from "@/components/shared/loading-spinner";

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

// ── Columna droppable ─────────────────────────────────────────────
function DroppableColumn({ id, children, style }: { id: string; children: React.ReactNode; style?: React.CSSProperties }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} style={{ ...style, outline: isOver ? "2px solid var(--verde)" : undefined, transition: "outline 0.15s" }}>
      {children}
    </div>
  );
}

// ── Componente tarjeta tarea (draggable) ──────────────────────────
function TareaCard({
  tarea,
  onEliminar,
  onEditar,
  isDragOverlay = false,
}: {
  tarea: any;
  onEliminar?: (id: string) => void;
  onEditar?: (tarea: any) => void;
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
      {/* Fila: prioridad + acciones */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{
          fontSize: "0.62rem", fontWeight: 700, padding: "0.15rem 0.5rem",
          borderRadius: "999px", background: `${pri.color}18`, color: pri.color,
          textTransform: "uppercase", letterSpacing: "0.04em",
        }}>
          {pri.label}
        </span>
        {!isDragOverlay && (
          <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            {onEditar && (
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); onEditar(tarea); }}
                title="Editar tarea"
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", lineHeight: 1, padding: "0 3px", display: "flex" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--verde)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "11px", height: "11px" }}>
                  <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            {onEliminar && (
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); onEliminar(tarea.id); }}
                title="Eliminar tarea"
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "0.75rem", lineHeight: 1, padding: "0 2px" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#ef4444"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
              >
                ✕
              </button>
            )}
          </div>
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

      {/* Responsables */}
      {tarea.responsables?.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", flexWrap: "wrap" }}>
          {tarea.responsables.map((r: any) => (
            <span key={r.id} style={{
              fontSize: "0.6rem", fontWeight: 600, padding: "0.1rem 0.45rem",
              borderRadius: "999px", background: "rgba(74,139,0,0.1)",
              color: "var(--verde)", border: "1px solid rgba(74,139,0,0.2)",
            }}>
              {r.nombre.split(" ")[0]}
            </span>
          ))}
        </div>
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

// ── Diálogo de confirmación ───────────────────────────────────────
function ConfirmDialog({
  open, onClose, onConfirm, title, message, danger = true,
}: {
  open: boolean; onClose: () => void; onConfirm: () => void;
  title: string; message: string; danger?: boolean;
}) {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" style={{ position: "relative", zIndex: 70 }} onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-150" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)" }} />
        </Transition.Child>
        <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <Transition.Child as={Fragment} enter="ease-out duration-150" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-100" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
            <Dialog.Panel style={{ width: "100%", maxWidth: "380px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "14px", padding: "1.5rem", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.85rem", marginBottom: "1.1rem" }}>
                {danger && (
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" style={{ width: "18px", height: "18px" }}>
                      <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
                <div>
                  <Dialog.Title style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 0.3rem" }}>
                    {title}
                  </Dialog.Title>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>{message}</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.65rem", justifyContent: "flex-end" }}>
                <button onClick={onClose} style={{ padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid var(--border)", background: "transparent", cursor: "pointer", fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                  Cancelar
                </button>
                <button onClick={() => { onConfirm(); onClose(); }} style={{ padding: "0.5rem 1rem", borderRadius: "8px", border: "none", background: danger ? "#ef4444" : "var(--verde)", color: "#fff", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
                  Eliminar
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
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
  const [tareaFrm, setTareaFrm] = useState({ titulo: "", descripcion: "", prioridad: "media", fechaLimite: "", responsablesIds: [] as string[] });
  const [tareaLoading, setTareaLoading] = useState(false);

  // ── Modal editar tarea ──
  const [modalEditTarea, setModalEditTarea] = useState(false);
  const [editTareaData, setEditTareaData] = useState<any>(null);
  const [editTareaFrm, setEditTareaFrm] = useState({ titulo: "", descripcion: "", prioridad: "media", fechaLimite: "", responsablesIds: [] as string[] });
  const [editTareaLoading, setEditTareaLoading] = useState(false);

  // ── Confirm dialog ──
  const [confirmState, setConfirmState] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void }>({
    open: false, title: "", message: "", onConfirm: () => {},
  });
  function openConfirm(title: string, message: string, onConfirm: () => void) {
    setConfirmState({ open: true, title, message, onConfirm });
  }

  // ── Modal editar proyecto ──
  const [modalEditProyecto, setModalEditProyecto] = useState(false);
  const [editProyFrm, setEditProyFrm] = useState({ nombre: "", descripcion: "", estado: "", fechaEntrega: "", encargadosIds: [] as string[] });
  const [subadmins, setSubadmins] = useState<any[]>([]);
  const [editProyLoading, setEditProyLoading] = useState(false);

  // ── Fases colapsadas ──
  const [collapsedFases, setCollapsedFases] = useState<Set<string>>(new Set());
  function toggleFase(id: string) {
    setCollapsedFases((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // ── Drag & Drop ──
  const [activeTarea, setActiveTarea] = useState<any>(null);
  // Ref que siempre apunta al estado más reciente (evita stale closures)
  const implRef = useRef<any[]>([]);
  useEffect(() => { implRef.current = implementaciones; }, [implementaciones]);
  // Columna original al iniciar el drag
  const origColRef = useRef<string | null>(null);

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

  // helpers DnD — usa implRef para siempre leer estado fresco
  function findColKeyFresh(tareaId: string): string | null {
    for (const impl of implRef.current) {
      const t = impl.tareas?.find((t: any) => t.id === tareaId);
      if (t) return t.columna;
    }
    return null;
  }

  function handleDragStart(event: DragStartEvent) {
    const tareaId = event.active.id as string;
    origColRef.current = findColKeyFresh(tareaId); // guarda columna original
    for (const impl of implRef.current) {
      const t = impl.tareas?.find((t: any) => t.id === tareaId);
      if (t) { setActiveTarea(t); break; }
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const tareaId = active.id as string;
    const overId = over.id as string;

    // over puede ser un colKey (DroppableColumn) o el id de una tarea
    const targetCol = COL_KEYS.includes(overId)
      ? overId
      : findColKeyFresh(overId);

    if (!targetCol) return;
    // evitar actualización redundante si ya está en esa columna
    if (findColKeyFresh(tareaId) === targetCol) return;

    // actualización optimista del estado local
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
    const { active } = event;
    setActiveTarea(null);

    const tareaId = active.id as string;
    // Leemos del ref fresco: ya tiene el estado actualizado por handleDragOver
    const currentCol = findColKeyFresh(tareaId);
    const origCol = origColRef.current;
    origColRef.current = null;

    // Sin cambio real → no llamar API
    if (!currentCol || !origCol || currentCol === origCol) return;

    try {
      await moverTarea(tareaId, currentCol);
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

  function handleEliminarFase(implId: string) {
    openConfirm(
      "Eliminar fase",
      "Se eliminarán esta fase y todas sus tareas. Esta acción no se puede deshacer.",
      async () => { try { await eliminarImplementacion(implId); cargar(); } catch {} }
    );
  }

  // ── Handlers tareas ──
  function abrirModalTarea(implId: string, colKey: string) {
    setTareaCtx({ implId, colKey });
    setTareaFrm({ titulo: "", descripcion: "", prioridad: "media", fechaLimite: "", responsablesIds: [] });
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
        responsablesIds: tareaFrm.responsablesIds.length > 0 ? tareaFrm.responsablesIds : undefined,
      });
      setModalTarea(false);
      cargar();
    } finally {
      setTareaLoading(false);
    }
  }

  function handleEliminarTarea(tareaId: string) {
    openConfirm(
      "Eliminar tarea",
      "¿Seguro que quieres eliminar esta tarea? Esta acción no se puede deshacer.",
      async () => {
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
    );
  }

  function abrirEditTarea(tarea: any) {
    setEditTareaData(tarea);
    setEditTareaFrm({
      titulo: tarea.titulo ?? "",
      descripcion: tarea.descripcion ?? "",
      prioridad: tarea.prioridad ?? "media",
      fechaLimite: tarea.fechaLimite ? tarea.fechaLimite.split("T")[0] : "",
      responsablesIds: tarea.responsables?.map((r: any) => r.id) ?? [],
    });
    setModalEditTarea(true);
  }

  async function handleEditarTarea(e: React.FormEvent) {
    e.preventDefault();
    if (!editTareaData) return;
    setEditTareaLoading(true);
    try {
      const updated = await actualizarTarea(editTareaData.id, {
        titulo: editTareaFrm.titulo,
        descripcion: editTareaFrm.descripcion || undefined,
        prioridad: editTareaFrm.prioridad,
        fechaLimite: editTareaFrm.fechaLimite || undefined,
        responsablesIds: editTareaFrm.responsablesIds,
      });
      setImplementaciones((prev) =>
        prev.map((impl) => ({
          ...impl,
          tareas: impl.tareas?.map((t: any) => t.id === editTareaData.id ? { ...t, ...updated } : t),
        }))
      );
      setModalEditTarea(false);
    } catch (err: any) {
      openConfirm("Error", err.message ?? "Error al actualizar tarea", () => {});
    } finally {
      setEditTareaLoading(false);
    }
  }

  function abrirEditProyecto() {
    setEditProyFrm({
      nombre: proyecto?.nombre ?? "",
      descripcion: proyecto?.descripcion ?? "",
      estado: proyecto?.estado ?? "en_progreso",
      fechaEntrega: proyecto?.fechaEntrega ? proyecto.fechaEntrega.split("T")[0] : "",
      encargadosIds: proyecto?.encargados?.map((e: any) => e.id) ?? [],
    });
    getClientes().then((all: any[]) => setSubadmins(all.filter((u) => u.rol === "subadmin"))).catch(() => {});
    setModalEditProyecto(true);
  }

  async function handleEditarProyecto(e: React.FormEvent) {
    e.preventDefault();
    setEditProyLoading(true);
    try {
      await actualizarProyecto(id, {
        nombre: editProyFrm.nombre,
        descripcion: editProyFrm.descripcion || undefined,
        estado: editProyFrm.estado,
        fechaEntrega: editProyFrm.fechaEntrega || undefined,
        encargadosIds: editProyFrm.encargadosIds,
      });
      setModalEditProyecto(false);
      cargar();
    } catch (err: any) {
      openConfirm("Error", err.message ?? "Error al actualizar proyecto", () => {});
    } finally {
      setEditProyLoading(false);
    }
  }

  const inputS: React.CSSProperties = {
    padding: "0.5rem 0.75rem", borderRadius: "8px", fontSize: "0.8rem",
    border: "1px solid var(--border)", background: "var(--bg-soft)",
    color: "var(--text-primary)", outline: "none", width: "100%", boxSizing: "border-box",
  };

  if (loading) return <LoadingSpinner text="Cargando kanban..." />;

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
        <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "1.25rem", display: "flex", flexDirection: "column", gap: "0.85rem" }}>

          {/* Fila 1: back + título + estado + acción */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              onClick={() => router.back()}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: "30px", height: "30px", borderRadius: "8px", flexShrink: 0,
                background: "var(--bg-soft)", border: "1px solid var(--border)",
                cursor: "pointer", color: "var(--text-muted)", transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--verde)"; e.currentTarget.style.color = "var(--verde)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
              title="Volver"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "13px", height: "13px" }}>
                <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <h1 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-primary)", margin: 0, lineHeight: 1.2 }}>
              {proyecto?.nombre}
            </h1>

            {estadoInfo && (
              <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "0.2rem 0.65rem", borderRadius: "999px", background: `${estadoInfo.color}18`, color: estadoInfo.color, border: `1px solid ${estadoInfo.color}`, whiteSpace: "nowrap" }}>
                {estadoInfo.label}
              </span>
            )}

            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <button
                onClick={abrirEditProyecto}
                style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 0.9rem", borderRadius: "10px", fontSize: "0.78rem", fontWeight: 600, background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)", cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--verde)"; e.currentTarget.style.color = "var(--verde)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "13px", height: "13px" }}><path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Editar
              </button>
              <button
                onClick={() => setModalFase(true)}
                style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 1rem", borderRadius: "10px", fontSize: "0.78rem", fontWeight: 600, background: "var(--verde)", border: "none", color: "#fff", cursor: "pointer", transition: "opacity 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: "13px", height: "13px" }}><path d="M12 4.5v15m7.5-7.5h-15" strokeLinecap="round" /></svg>
                Nueva fase
              </button>
            </div>
          </div>

          {/* Fila 2: metadata + progreso */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
            {proyecto?.cliente && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "13px", height: "13px", color: "var(--text-muted)", flexShrink: 0 }}>
                  <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                  <strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>{proyecto.cliente.nombre}</strong>
                  {proyecto.cliente.empresa && <span style={{ color: "var(--text-muted)" }}> · {proyecto.cliente.empresa}</span>}
                </span>
              </div>
            )}

            {proyecto?.encargados?.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "13px", height: "13px", color: "var(--text-muted)", flexShrink: 0 }}>
                  <path d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                  {proyecto.encargados.map((e: any) => e.nombre).join(", ")}
                </span>
              </div>
            )}

            {proyecto?.fechaEntrega && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "13px", height: "13px", color: "var(--text-muted)", flexShrink: 0 }}>
                  <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                  Entrega <strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>{fmt(proyecto.fechaEntrega)}</strong>
                </span>
              </div>
            )}

            {/* Progreso — al final, ocupa el espacio restante */}
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.6rem", minWidth: "180px" }}>
              <div style={{ flex: 1, height: "5px", borderRadius: "999px", background: "var(--bg-soft)" }}>
                <div style={{ height: "100%", width: `${proyecto?.progreso ?? 0}%`, borderRadius: "999px", background: "var(--verde)", transition: "width 0.4s" }} />
              </div>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--verde)", whiteSpace: "nowrap", minWidth: "2.2rem", textAlign: "right" }}>
                {proyecto?.progreso ?? 0}%
              </span>
            </div>
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

          const isCollapsed = collapsedFases.has(impl.id);

          return (
            <div key={impl.id} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden" }}>
              {/* Header fase */}
              <div
                onClick={() => toggleFase(impl.id)}
                style={{ padding: "0.9rem 1.25rem", borderBottom: isCollapsed ? "none" : "1px solid var(--border)", display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", cursor: "pointer", userSelect: "none" }}
              >
                {/* Chevron */}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ width: "14px", height: "14px", flexShrink: 0, color: "var(--text-muted)", transition: "transform 0.2s", transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)" }}>
                  <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>

                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)" }}>{impl.nombre}</span>
                  <span style={{ fontSize: "0.65rem", fontWeight: 600, padding: "0.15rem 0.5rem", borderRadius: "999px", background: "var(--bg-soft)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                    {TIPOS.find((t) => t.key === impl.tipo)?.label ?? impl.tipo}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }} onClick={(e) => e.stopPropagation()}>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    {completadas}/{totalTareas} tareas · {pctFase}%
                  </span>
                  <div style={{ width: "80px", height: "4px", borderRadius: "999px", background: "var(--bg-soft)" }}>
                    <div style={{ height: "100%", width: `${pctFase}%`, borderRadius: "999px", background: "var(--verde)" }} />
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEliminarFase(impl.id); }}
                    title="Eliminar fase"
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "0.85rem", padding: "2px" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#ef4444"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
                  >
                    🗑
                  </button>
                </div>
              </div>

              {/* Tablero kanban */}
              {!isCollapsed && <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, overflowX: "auto" }}>

                {COLUMNAS.map((col, colIdx) => {
                  const tareas = tareasPorCol[col.key];
                  const tareaIds = tareas.map((t: any) => t.id);
                  return (
                    <SortableContext key={col.key} id={col.key} items={tareaIds} strategy={verticalListSortingStrategy}>
                      <DroppableColumn
                        id={col.key}
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
                            <TareaCard key={tarea.id} tarea={tarea} onEliminar={handleEliminarTarea} onEditar={abrirEditTarea} />
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
                      </DroppableColumn>
                    </SortableContext>
                  );
                })}
              </div>}
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
              <input type="date" value={tareaFrm.fechaLimite} onChange={(e) => setTareaFrm((p) => ({ ...p, fechaLimite: e.target.value }))} style={inputS} />
            </div>
          </div>
          {/* Responsables */}
          {proyecto?.encargados?.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>Responsables</label>
              <div style={{ border: "1px solid var(--border)", borderRadius: "8px", background: "var(--bg-soft)", padding: "0.4rem 0", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                {proyecto.encargados.map((enc: any) => (
                  <label key={enc.id} style={{ display: "flex", alignItems: "center", gap: "0.55rem", padding: "0.35rem 0.75rem", cursor: "pointer", fontSize: "0.78rem", color: "var(--text-primary)", userSelect: "none" }}>
                    <input
                      type="checkbox"
                      checked={tareaFrm.responsablesIds.includes(enc.id)}
                      onChange={() => setTareaFrm((p) => ({
                        ...p,
                        responsablesIds: p.responsablesIds.includes(enc.id)
                          ? p.responsablesIds.filter((x) => x !== enc.id)
                          : [...p.responsablesIds, enc.id],
                      }))}
                      style={{ accentColor: "var(--verde)", width: "14px", height: "14px" }}
                    />
                    {enc.nombre}
                  </label>
                ))}
              </div>
              {tareaFrm.responsablesIds.length > 0 && (
                <p style={{ fontSize: "0.7rem", color: "var(--verde)", margin: 0 }}>
                  {tareaFrm.responsablesIds.length} responsable{tareaFrm.responsablesIds.length > 1 ? "s" : ""} asignado{tareaFrm.responsablesIds.length > 1 ? "s" : ""}
                </p>
              )}
            </div>
          )}
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
      {/* ── Modal editar tarea ── */}
      <AppModal open={modalEditTarea} onClose={() => setModalEditTarea(false)} title="Editar tarea">
        <form onSubmit={handleEditarTarea} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>Título <span style={{ color: "#ef4444" }}>*</span></label>
            <input required value={editTareaFrm.titulo} onChange={(e) => setEditTareaFrm((p) => ({ ...p, titulo: e.target.value }))} style={inputS} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>Descripción</label>
            <textarea value={editTareaFrm.descripcion} onChange={(e) => setEditTareaFrm((p) => ({ ...p, descripcion: e.target.value }))} rows={2} style={{ ...inputS, resize: "vertical" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>Prioridad</label>
              <select value={editTareaFrm.prioridad} onChange={(e) => setEditTareaFrm((p) => ({ ...p, prioridad: e.target.value }))} style={inputS}>
                {PRIORIDADES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>Fecha límite</label>
              <input type="date" value={editTareaFrm.fechaLimite} onChange={(e) => setEditTareaFrm((p) => ({ ...p, fechaLimite: e.target.value }))} style={inputS} />
            </div>
          </div>
          {/* Responsables — solo encargados del proyecto */}
          {proyecto?.encargados?.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>Responsables</label>
              <div style={{ border: "1px solid var(--border)", borderRadius: "8px", background: "var(--bg-soft)", padding: "0.4rem 0", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                {proyecto.encargados.map((enc: any) => (
                  <label key={enc.id} style={{ display: "flex", alignItems: "center", gap: "0.55rem", padding: "0.35rem 0.75rem", cursor: "pointer", fontSize: "0.78rem", color: "var(--text-primary)", userSelect: "none" }}>
                    <input
                      type="checkbox"
                      checked={editTareaFrm.responsablesIds.includes(enc.id)}
                      onChange={() => setEditTareaFrm((p) => ({
                        ...p,
                        responsablesIds: p.responsablesIds.includes(enc.id)
                          ? p.responsablesIds.filter((x) => x !== enc.id)
                          : [...p.responsablesIds, enc.id],
                      }))}
                      style={{ accentColor: "var(--verde)", width: "14px", height: "14px" }}
                    />
                    {enc.nombre}
                  </label>
                ))}
              </div>
              {editTareaFrm.responsablesIds.length > 0 && (
                <p style={{ fontSize: "0.7rem", color: "var(--verde)", margin: 0 }}>
                  {editTareaFrm.responsablesIds.length} responsable{editTareaFrm.responsablesIds.length > 1 ? "s" : ""} asignado{editTareaFrm.responsablesIds.length > 1 ? "s" : ""}
                </p>
              )}
            </div>
          )}
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
            <button type="button" onClick={() => setModalEditTarea(false)} style={{ flex: 1, padding: "0.55rem", borderRadius: "8px", border: "1px solid var(--border)", background: "transparent", cursor: "pointer", fontSize: "0.8rem", color: "var(--text-secondary)" }}>Cancelar</button>
            <button type="submit" disabled={editTareaLoading} style={{ flex: 2, padding: "0.55rem", borderRadius: "8px", border: "none", background: "var(--verde)", color: "#fff", fontWeight: 600, fontSize: "0.8rem", cursor: editTareaLoading ? "wait" : "pointer" }}>
              {editTareaLoading ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </AppModal>

      {/* ── Modal editar proyecto ── */}
      <AppModal open={modalEditProyecto} onClose={() => setModalEditProyecto(false)} title="Editar proyecto">
        <form onSubmit={handleEditarProyecto} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>Nombre <span style={{ color: "#ef4444" }}>*</span></label>
            <input required value={editProyFrm.nombre} onChange={(e) => setEditProyFrm((p) => ({ ...p, nombre: e.target.value }))} style={inputS} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>Descripción</label>
            <textarea value={editProyFrm.descripcion} onChange={(e) => setEditProyFrm((p) => ({ ...p, descripcion: e.target.value }))} rows={2} style={{ ...inputS, resize: "vertical" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>Estado</label>
              <select value={editProyFrm.estado} onChange={(e) => setEditProyFrm((p) => ({ ...p, estado: e.target.value }))} style={inputS}>
                {Object.entries(ESTADO_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>Fecha de entrega</label>
              <input type="date" value={editProyFrm.fechaEntrega} onChange={(e) => setEditProyFrm((p) => ({ ...p, fechaEntrega: e.target.value }))} style={inputS} />
            </div>
          </div>
          {/* Encargados */}
          {subadmins.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>Encargados del equipo</label>
              <div style={{ border: "1px solid var(--border)", borderRadius: "8px", background: "var(--bg-soft)", maxHeight: "110px", overflowY: "auto", padding: "0.4rem 0", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                {subadmins.map((s: any) => (
                  <label key={s.id} style={{ display: "flex", alignItems: "center", gap: "0.55rem", padding: "0.35rem 0.75rem", cursor: "pointer", fontSize: "0.78rem", color: "var(--text-primary)", userSelect: "none" }}>
                    <input
                      type="checkbox"
                      checked={editProyFrm.encargadosIds.includes(s.id)}
                      onChange={() => setEditProyFrm((p) => ({
                        ...p,
                        encargadosIds: p.encargadosIds.includes(s.id)
                          ? p.encargadosIds.filter((x) => x !== s.id)
                          : [...p.encargadosIds, s.id],
                      }))}
                      style={{ accentColor: "var(--verde)", width: "14px", height: "14px" }}
                    />
                    {s.nombre}
                  </label>
                ))}
              </div>
              {editProyFrm.encargadosIds.length > 0 && (
                <p style={{ fontSize: "0.7rem", color: "var(--verde)", margin: 0 }}>
                  {editProyFrm.encargadosIds.length} encargado{editProyFrm.encargadosIds.length > 1 ? "s" : ""} seleccionado{editProyFrm.encargadosIds.length > 1 ? "s" : ""}
                </p>
              )}
            </div>
          )}
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
            <button type="button" onClick={() => setModalEditProyecto(false)} style={{ flex: 1, padding: "0.55rem", borderRadius: "8px", border: "1px solid var(--border)", background: "transparent", cursor: "pointer", fontSize: "0.8rem", color: "var(--text-secondary)" }}>Cancelar</button>
            <button type="submit" disabled={editProyLoading} style={{ flex: 2, padding: "0.55rem", borderRadius: "8px", border: "none", background: "var(--verde)", color: "#fff", fontWeight: 600, fontSize: "0.8rem", cursor: editProyLoading ? "wait" : "pointer" }}>
              {editProyLoading ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </AppModal>
      <ConfirmDialog
        open={confirmState.open}
        onClose={() => setConfirmState((p) => ({ ...p, open: false }))}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
      />
    </DndContext>
  );
}

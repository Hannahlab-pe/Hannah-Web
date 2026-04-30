"use client";
import { DragOverlay, useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const COLUMNAS = [
  { key: "por_hacer",   label: "Por hacer",   color: "#6B7280", bg: "rgba(107,114,128,0.07)" },
  { key: "en_progreso", label: "En progreso", color: "#2563EB", bg: "rgba(37,99,235,0.07)"   },
  { key: "en_revision", label: "En revisión", color: "#F59E0B", bg: "rgba(245,158,11,0.07)"  },
  { key: "completado",  label: "Completado",  color: "#4A8B00", bg: "rgba(74,139,0,0.07)"    },
];

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

function fmt(fecha?: string) {
  if (!fecha) return null;
  return new Date(fecha).toLocaleDateString("es-PE", { day: "2-digit", month: "short" });
}

function DroppableColumn({ id, children, style }: { id: string; children: React.ReactNode; style?: React.CSSProperties }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} style={{ ...style, outline: isOver ? "2px solid var(--verde)" : undefined, transition: "outline 0.15s" }}>
      {children}
    </div>
  );
}

export function TareaCard({
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

      {(tarea.responsables?.length > 0 || tarea.fechaLimite) && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.1rem" }}>
          {tarea.responsables?.length > 0 ? (
            <div style={{ display: "flex", alignItems: "center" }}>
              {tarea.responsables.map((r: any, i: number) => {
                const AVATAR_COLORS = ["#4A8B00", "#0ea5e9", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4"];
                const bg = AVATAR_COLORS[r.nombre.charCodeAt(0) % AVATAR_COLORS.length];
                const inicial = r.nombre.trim().charAt(0).toUpperCase();
                return (
                  <div key={r.id} title={r.nombre} style={{
                    width: 22, height: 22, borderRadius: "50%", background: bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.58rem", fontWeight: 700, color: "#fff",
                    border: "2px solid var(--bg)", marginLeft: i > 0 ? -6 : 0, flexShrink: 0,
                  }}>
                    {inicial}
                  </div>
                );
              })}
            </div>
          ) : <span />}

          {tarea.fechaLimite && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--text-muted)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 11, height: 11, flexShrink: 0 }}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span style={{ fontSize: "0.65rem" }}>{fmt(tarea.fechaLimite)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface KanbanViewProps {
  implementaciones: any[];
  proyecto: any;
  activeTarea: any;
  collapsedFases: Set<string>;
  toggleFase: (id: string) => void;
  onEliminarFase: (id: string) => void;
  onEliminarTarea: (id: string) => void;
  onEditarTarea: (tarea: any) => void;
  onAgregarTarea: (implId: string, colKey: string) => void;
  onModalFase: () => void;
}

export default function KanbanView({
  implementaciones,
  activeTarea,
  collapsedFases,
  toggleFase,
  onEliminarFase,
  onEliminarTarea,
  onEditarTarea,
  onAgregarTarea,
  onModalFase,
}: KanbanViewProps) {
  return (
    <>
      {implementaciones.length === 0 && (
        <div style={{ padding: "3rem", textAlign: "center", border: "1px dashed var(--border)", borderRadius: "14px" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0 0 1rem" }}>
            Aún no hay fases en este proyecto. Crea la primera para empezar.
          </p>
          <button
            onClick={onModalFase}
            style={{ padding: "0.55rem 1.2rem", borderRadius: "10px", background: "var(--verde)", border: "none", color: "#fff", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer" }}
          >
            + Nueva fase
          </button>
        </div>
      )}

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
            <div
              onClick={() => toggleFase(impl.id)}
              style={{ padding: "0.9rem 1.25rem", borderBottom: isCollapsed ? "none" : "1px solid var(--border)", display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", cursor: "pointer", userSelect: "none" }}
            >
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
                  onClick={(e) => { e.stopPropagation(); onEliminarFase(impl.id); }}
                  title="Eliminar fase"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "0.85rem", padding: "2px" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#ef4444"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
                >
                  🗑
                </button>
              </div>
            </div>

            {!isCollapsed && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, overflowX: "auto" }}>
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
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.75rem" }}>
                          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: col.color, flexShrink: 0 }} />
                          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: col.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            {col.label}
                          </span>
                          <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginLeft: "auto", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "999px", padding: "0 0.4rem" }}>
                            {tareas.length}
                          </span>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                          {tareas.map((tarea: any) => (
                            <TareaCard key={tarea.id} tarea={tarea} onEliminar={onEliminarTarea} onEditar={onEditarTarea} />
                          ))}
                          {tareas.length === 0 && (
                            <div style={{ padding: "1rem 0.5rem", textAlign: "center", borderRadius: "8px", border: "1px dashed var(--border)" }}>
                              <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", margin: 0 }}>Arrastra aquí</p>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => onAgregarTarea(impl.id, col.key)}
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
              </div>
            )}
          </div>
        );
      })}

      {implementaciones.length > 0 && (
        <button
          onClick={onModalFase}
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

      <DragOverlay>
        {activeTarea ? <TareaCard tarea={activeTarea} isDragOverlay /> : null}
      </DragOverlay>
    </>
  );
}

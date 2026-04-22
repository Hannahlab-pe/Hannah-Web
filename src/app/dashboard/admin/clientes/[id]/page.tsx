"use client";

import { useState, useEffect, useCallback, Fragment } from "react";
import { useParams, useRouter } from "next/navigation";
import { Dialog, Transition } from "@headlessui/react";
import { getCliente, getProyectosPorCliente, getClientes, crearProyecto, type UsuarioSession } from "@/libs/api";
import LoadingSpinner from "@/components/shared/loading-spinner";
import PageHeader from "@/components/shared/page-header";

// ── Estilos base modal ────────────────────────────────────────────
const INP: React.CSSProperties = {
  padding: "0.5rem 0.75rem", borderRadius: "8px", fontSize: "0.8rem",
  border: "1px solid var(--border)", background: "var(--bg-soft)",
  color: "var(--text-primary)", outline: "none", width: "100%", boxSizing: "border-box",
};
const LBL: React.CSSProperties = {
  fontSize: "0.72rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.3rem", display: "block",
};

// ── Modal nuevo proyecto (cliente pre-seleccionado) ───────────────
function ModalNuevoProyecto({ open, onClose, onCreado, clienteId, clienteNombre }: {
  open: boolean;
  onClose: () => void;
  onCreado: () => void;
  clienteId: string;
  clienteNombre: string;
}) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [encargadosIds, setEncargadosIds] = useState<string[]>([]);
  const [subadmins, setSubadmins] = useState<UsuarioSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    getClientes().then((all: any[]) =>
      setSubadmins(all.filter((u) => u.rol === "subadmin"))
    ).catch(() => {});
  }, [open]);

  function toggleEncargado(id: string) {
    setEncargadosIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await crearProyecto({
        nombre,
        descripcion: descripcion || undefined,
        clienteId,
        fechaEntrega: fechaEntrega || undefined,
        encargadosIds: encargadosIds.length > 0 ? encargadosIds : undefined,
      });
      setNombre(""); setDescripcion(""); setFechaEntrega(""); setEncargadosIds([]);
      onCreado();
      onClose();
    } catch (err: any) {
      setError(err.message ?? "Error al crear proyecto");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" style={{ position: "relative", zIndex: 50 }} onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)" }} />
        </Transition.Child>

        <div style={{ position: "fixed", inset: 0, overflowY: "auto" }}>
          <div style={{ display: "flex", minHeight: "100%", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel style={{
                width: "100%", maxWidth: "560px",
                background: "var(--bg)", border: "1px solid var(--border)",
                borderRadius: "16px", padding: "2rem",
                display: "flex", flexDirection: "column", gap: "1.1rem",
                boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
              }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div>
                    <Dialog.Title style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                      Nuevo proyecto
                    </Dialog.Title>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: "0.2rem 0 0" }}>
                      Cliente: <strong style={{ color: "var(--text-primary)" }}>{clienteNombre}</strong>
                    </p>
                  </div>
                  <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "1.2rem", lineHeight: 1 }}>✕</button>
                </div>

                {error && (
                  <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid #ef4444", borderRadius: "8px", padding: "0.6rem 0.9rem", fontSize: "0.75rem", color: "#ef4444" }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  <div>
                    <label style={LBL}>Nombre del proyecto <span style={{ color: "#ef4444" }}>*</span></label>
                    <input required type="text" placeholder="Ej: Web corporativa..." value={nombre} onChange={(e) => setNombre(e.target.value)} style={INP} />
                  </div>

                  <div>
                    <label style={LBL}>Descripción</label>
                    <textarea rows={2} placeholder="Descripción breve del proyecto..." value={descripcion} onChange={(e) => setDescripcion(e.target.value)} style={{ ...INP, resize: "vertical" }} />
                  </div>

                  {subadmins.length > 0 && (
                    <div>
                      <label style={LBL}>Encargados del equipo</label>
                      <div style={{ border: "1px solid var(--border)", borderRadius: "8px", background: "var(--bg-soft)", maxHeight: "110px", overflowY: "auto", padding: "0.4rem 0", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                        {subadmins.map((s) => (
                          <label key={s.id} style={{ display: "flex", alignItems: "center", gap: "0.55rem", padding: "0.35rem 0.75rem", cursor: "pointer", fontSize: "0.78rem", color: "var(--text-primary)", userSelect: "none" }}>
                            <input type="checkbox" checked={encargadosIds.includes(s.id)} onChange={() => toggleEncargado(s.id)} style={{ accentColor: "var(--verde)", width: "14px", height: "14px", cursor: "pointer" }} />
                            {s.nombre}
                          </label>
                        ))}
                      </div>
                      {encargadosIds.length > 0 && (
                        <p style={{ fontSize: "0.7rem", color: "var(--verde)", margin: "0.3rem 0 0" }}>
                          {encargadosIds.length} encargado{encargadosIds.length > 1 ? "s" : ""} seleccionado{encargadosIds.length > 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <label style={LBL}>Fecha de entrega</label>
                    <input type="date" value={fechaEntrega} onChange={(e) => setFechaEntrega(e.target.value)} style={INP} />
                  </div>

                  <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
                    <button type="button" onClick={onClose} style={{ flex: 1, padding: "0.6rem", borderRadius: "8px", fontSize: "0.8rem", border: "1px solid var(--border)", background: "transparent", cursor: "pointer", color: "var(--text-secondary)", fontWeight: 500 }}>
                      Cancelar
                    </button>
                    <button type="submit" disabled={loading} style={{ flex: 2, padding: "0.6rem", borderRadius: "8px", fontSize: "0.82rem", background: "var(--verde)", border: "none", color: "#fff", fontWeight: 600, cursor: loading ? "wait" : "pointer", opacity: loading ? 0.7 : 1 }}>
                      {loading ? "Creando..." : "Crear proyecto"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

const ESTADO_LABELS: Record<string, { label: string; color: string }> = {
  pendiente:   { label: "Pendiente",   color: "#f59e0b" },
  en_progreso: { label: "En progreso", color: "var(--verde)" },
  completado:  { label: "Completado",  color: "#3b82f6" },
  pausado:     { label: "Pausado",     color: "#6b7280" },
};

function fmt(fecha?: string) {
  if (!fecha) return null;
  return new Date(fecha).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ClienteDetallePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [cliente, setCliente] = useState<any>(null);
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalProyecto, setModalProyecto] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const [cli, projs] = await Promise.all([
        getCliente(id),
        getProyectosPorCliente(id),
      ]);
      setCliente(cli);
      setProyectos(projs);
    } catch (e: any) {
      setError(e.message ?? "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  if (loading) return <LoadingSpinner text="Cargando cliente..." />;
  if (error) return (
    <div style={{ padding: "2rem", color: "#ef4444", fontSize: "0.85rem" }}>{error}</div>
  );

  const inicial = cliente?.nombre?.charAt(0).toUpperCase() ?? "?";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      <PageHeader
        title={cliente?.nombre ?? "Cliente"}
        subtitle={cliente?.empresa ? `${cliente.empresa} · ${cliente.email}` : cliente?.email}
        backHref="/dashboard/admin/clientes"
        backLabel="Volver a Clientes"
      />

      {/* Info card */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: "1.25rem",
        padding: "1.25rem 1.5rem",
        background: "var(--bg)", border: "1px solid var(--border)",
        borderRadius: "14px", alignItems: "center",
      }}>
        {/* Avatar */}
        <div style={{
          width: "52px", height: "52px", borderRadius: "50%",
          background: "var(--verde)", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: "1.2rem", fontWeight: 700, color: "#fff",
          flexShrink: 0,
        }}>
          {inicial}
        </div>

        {/* Datos */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem 2.5rem" }}>
          {[
            { label: "Nombre",  value: cliente?.nombre },
            { label: "Email",   value: cliente?.email },
            { label: "Empresa", value: cliente?.empresa ?? "—" },
            { label: "Teléfono", value: cliente?.telefono ?? "—" },
            { label: "Estado",  value: cliente?.activo ? "Activo" : "Inactivo", color: cliente?.activo ? "var(--verde)" : "#ef4444" },
            { label: "Desde",   value: cliente?.creadoEn ? fmt(cliente.creadoEn) : "—" },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <p style={{ fontSize: "0.6rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 0.15rem" }}>{label}</p>
              <p style={{ fontSize: "0.82rem", fontWeight: 600, color: color ?? "var(--text-primary)", margin: 0 }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Proyectos */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              Proyectos asignados
            </h2>
            <span style={{
              fontSize: "0.65rem", fontWeight: 700, padding: "0.15rem 0.55rem",
              borderRadius: "999px", background: "var(--bg-soft)", border: "1px solid var(--border)",
              color: "var(--text-muted)",
            }}>
              {proyectos.length}
            </span>
          </div>
          <button
            onClick={() => setModalProyecto(true)}
            style={{
              display: "flex", alignItems: "center", gap: "0.4rem",
              padding: "0.45rem 0.9rem", borderRadius: "8px", fontSize: "0.78rem",
              background: "var(--verde)", border: "none", color: "#fff",
              fontWeight: 600, cursor: "pointer",
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: "13px", height: "13px" }}>
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            Nuevo proyecto
          </button>
        </div>

        {proyectos.length === 0 ? (
          <div style={{
            padding: "3rem", textAlign: "center",
            border: "1px dashed var(--border)", borderRadius: "14px",
          }}>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>
              Este cliente aún no tiene proyectos asignados.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
            {proyectos.map((p) => {
              const estado = ESTADO_LABELS[p.estado] ?? { label: p.estado, color: "#6b7280" };
              return (
                <div
                  key={p.id}
                  onClick={() => router.push(`/dashboard/admin/proyectos/${p.id}`)}
                  style={{
                    background: "var(--bg)", border: "1px solid var(--border)",
                    borderRadius: "14px", padding: "1.25rem",
                    cursor: "pointer", display: "flex", flexDirection: "column", gap: "0.85rem",
                    transition: "box-shadow 0.2s, border-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 18px rgba(0,0,0,0.08)";
                    (e.currentTarget as HTMLDivElement).style.borderColor = "var(--verde)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                    (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
                  }}
                >
                  {/* Título + estado */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem" }}>
                    <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)", margin: 0, lineHeight: 1.3 }}>
                      {p.nombre}
                    </p>
                    <span style={{
                      flexShrink: 0, fontSize: "0.6rem", fontWeight: 700,
                      padding: "0.2rem 0.55rem", borderRadius: "999px",
                      background: `${estado.color}18`, color: estado.color, border: `1px solid ${estado.color}`,
                    }}>
                      {estado.label}
                    </span>
                  </div>

                  {p.descripcion && (
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any, overflow: "hidden" }}>
                      {p.descripcion}
                    </p>
                  )}

                  {/* Barra de progreso */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <div style={{ flex: 1, height: "5px", borderRadius: "999px", background: "var(--bg-soft)" }}>
                      <div style={{ width: `${p.progreso ?? 0}%`, height: "100%", borderRadius: "999px", background: "var(--verde)", transition: "width 0.4s" }} />
                    </div>
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--verde)", width: "2.5rem", textAlign: "right" }}>
                      {p.progreso ?? 0}%
                    </span>
                  </div>

                  {/* Footer */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.4rem" }}>
                    {p.fechaEntrega ? (
                      <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                        Entrega: <strong>{fmt(p.fechaEntrega)}</strong>
                      </span>
                    ) : <span />}
                    <span style={{
                      fontSize: "0.65rem", color: "var(--verde)", fontWeight: 600,
                      display: "flex", alignItems: "center", gap: "0.3rem",
                    }}>
                      Ver kanban →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ModalNuevoProyecto
        open={modalProyecto}
        onClose={() => setModalProyecto(false)}
        onCreado={cargar}
        clienteId={id}
        clienteNombre={cliente?.nombre ?? ""}
      />
    </div>
  );
}

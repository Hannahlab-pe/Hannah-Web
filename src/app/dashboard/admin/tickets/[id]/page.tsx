"use client";

import { useState, useEffect, useRef, useCallback, Fragment } from "react";
import { useParams, useRouter } from "next/navigation";
import { Dialog, Transition } from "@headlessui/react";
import { toast } from "sonner";
import {
  getTicket, getTicketMensajes, enviarMensajeTicket,
  cambiarEstadoTicket, asignarTicket, getClientes,
  getUsuarioGuardado,
} from "@/libs/api";
import LoadingSpinner from "@/components/shared/loading-spinner";

// ── Config ────────────────────────────────────────────────────────
const TIPO_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  comentario: { label: "Comentario",         color: "#6B7280", bg: "rgba(107,114,128,0.1)" },
  aporte:     { label: "Aporte/Sugerencia",  color: "#2563EB", bg: "rgba(37,99,235,0.1)"  },
  incidencia: { label: "Incidencia",         color: "#D97706", bg: "rgba(217,119,6,0.1)"  },
  bug:        { label: "Bug",                color: "#DC2626", bg: "rgba(220,38,38,0.1)"  },
};
const PRIORIDAD_COLOR: Record<string, string> = {
  baja: "#22c55e", media: "#f59e0b", alta: "#ef4444", critica: "#dc2626",
};
const ESTADOS = [
  { key: "abierto",     label: "Abierto",      color: "#f59e0b" },
  { key: "en_progreso", label: "En progreso",   color: "#3b82f6" },
  { key: "resuelto",    label: "Resuelto",      color: "#22c55e" },
  { key: "cerrado",     label: "Cerrado",       color: "#6b7280" },
];

function fmtHora(fecha: string) {
  return new Date(fecha).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
}
function fmtFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
}

const AVATAR_COLORS = ["#4A8B00", "#0ea5e9", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4"];
function avatarColor(nombre: string) {
  return AVATAR_COLORS[nombre.charCodeAt(0) % AVATAR_COLORS.length];
}
function Avatar({ nombre, size = 28 }: { nombre: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: avatarColor(nombre),
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, color: "#fff", flexShrink: 0,
    }}>
      {nombre.trim().charAt(0).toUpperCase()}
    </div>
  );
}

// ── Confirm dialog ────────────────────────────────────────────────
function ConfirmDialog({ open, onClose, onConfirm, title, message }: {
  open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string;
}) {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" style={{ position: "relative", zIndex: 70 }} onClose={onClose}>
        <Transition.Child as={Fragment}
          enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)" }} />
        </Transition.Child>
        <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <Transition.Child as={Fragment}
            enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
            leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
            <Dialog.Panel style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "16px", padding: "1.75rem", maxWidth: 400, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
              <Dialog.Title style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 0.5rem" }}>{title}</Dialog.Title>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: "0 0 1.5rem" }}>{message}</p>
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button onClick={onClose} style={{ padding: "0.5rem 1.1rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-soft)", color: "var(--text-secondary)", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
                <button onClick={() => { onConfirm(); onClose(); }} style={{ padding: "0.5rem 1.1rem", borderRadius: "8px", border: "none", background: "#ef4444", color: "#fff", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}>Confirmar</button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

export default function AdminTicketDetallePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [ticket, setTicket] = useState<any>(null);
  const [mensajes, setMensajes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [equipo, setEquipo] = useState<any[]>([]);
  const [confirm, setConfirm] = useState<{ open: boolean; title: string; message: string; fn: () => void }>({ open: false, title: "", message: "", fn: () => {} });

  const bottomRef = useRef<HTMLDivElement>(null);
  const yo = getUsuarioGuardado();

  const cargarTicket = useCallback(async () => {
    try {
      const t = await getTicket(id);
      setTicket(t);
    } catch { /* silencioso en polling */ }
  }, [id]);

  const cargarMensajes = useCallback(async () => {
    try {
      const msgs = await getTicketMensajes(id);
      setMensajes(msgs);
    } catch { /* silencioso en polling */ }
  }, [id]);

  const cargar = useCallback(async () => {
    try {
      const [t, msgs] = await Promise.all([getTicket(id), getTicketMensajes(id)]);
      setTicket(t);
      setMensajes(msgs);
    } catch { toast.error("Error al cargar el ticket"); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  // Polling cada 5s para mensajes nuevos
  useEffect(() => {
    const interval = setInterval(cargarMensajes, 5000);
    return () => clearInterval(interval);
  }, [cargarMensajes]);

  useEffect(() => {
    getClientes().then((u: any[]) => setEquipo(u.filter((x) => x.rol !== "cliente"))).catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  async function handleEnviar(e: React.FormEvent) {
    e.preventDefault();
    const contenido = texto.trim();
    if (!contenido) return;
    setEnviando(true);
    setTexto("");
    // Optimistic: agregar mensaje localmente antes de esperar respuesta
    const tempMsg = {
      id: `temp-${Date.now()}`,
      contenido,
      creadoEn: new Date().toISOString(),
      autor: { id: yo?.id, nombre: yo?.nombre ?? "Tú", rol: yo?.rol ?? "admin" },
    };
    setMensajes((prev) => [...prev, tempMsg]);
    try {
      await enviarMensajeTicket(id, contenido);
      // Reemplaza el optimista con el real
      await cargarMensajes();
      toast.success("Mensaje enviado");
    } catch {
      // Quita el optimista si falla
      setMensajes((prev) => prev.filter((m) => m.id !== tempMsg.id));
      setTexto(contenido);
      toast.error("Error al enviar el mensaje");
    } finally { setEnviando(false); }
  }

  async function handleEstado(estado: string) {
    try {
      await cambiarEstadoTicket(id, estado);
      await cargarTicket();
      toast.success(`Estado: ${ESTADOS.find((e) => e.key === estado)?.label}`);
    } catch { toast.error("Error al cambiar estado"); }
  }

  async function handleAsignar(usuarioId: string | null) {
    try {
      await asignarTicket(id, usuarioId);
      await cargarTicket();
      toast.success(usuarioId ? "Ticket asignado" : "Asignación removida");
    } catch { toast.error("Error al asignar ticket"); }
  }

  if (loading) return <LoadingSpinner text="Cargando ticket..." />;
  if (!ticket) return <div style={{ padding: "2rem", color: "#ef4444" }}>Ticket no encontrado</div>;

  const tipoCfg = TIPO_CONFIG[ticket.tipo] ?? TIPO_CONFIG.comentario;
  const estadoInfo = ESTADOS.find((e) => e.key === ticket.estado) ?? ESTADOS[0];

  return (
    <>
      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm((c) => ({ ...c, open: false }))}
        onConfirm={confirm.fn}
        title={confirm.title}
        message={confirm.message}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxWidth: "100%" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            onClick={() => router.push("/dashboard/admin/tickets")}
            style={{ background: "var(--bg-soft)", border: "1px solid var(--border)", borderRadius: "8px", padding: "0.4rem 0.7rem", cursor: "pointer", color: "var(--text-secondary)", fontSize: "0.8rem" }}
          >
            ← Tickets
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
              <span style={{ padding: "0.2rem 0.6rem", borderRadius: "6px", fontSize: "0.68rem", fontWeight: 700, background: tipoCfg.bg, color: tipoCfg.color }}>{tipoCfg.label}</span>
              <h1 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>{ticket.titulo}</h1>
            </div>
            <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: "0.2rem 0 0" }}>
              {ticket.cliente?.nombre} · {fmtFecha(ticket.creadoEn)}
            </p>
          </div>
        </div>

        {/* Layout principal */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.25rem", alignItems: "start" }}>

          {/* ── Chat ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden" }}>

            {/* Descripción inicial (mensaje del cliente) */}
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)", background: "var(--bg-soft)" }}>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <Avatar nombre={ticket.cliente?.nombre ?? "C"} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-primary)" }}>{ticket.cliente?.nombre}</span>
                    <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{fmtFecha(ticket.creadoEn)}</span>
                    <span style={{ fontSize: "0.6rem", padding: "0.1rem 0.4rem", borderRadius: "4px", background: "rgba(107,114,128,0.1)", color: "var(--text-muted)", fontWeight: 600 }}>Descripción inicial</span>
                  </div>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{ticket.descripcion}</p>
                </div>
              </div>
            </div>

            {/* Mensajes */}
            <div style={{ flex: 1, padding: "1rem 1.5rem", display: "flex", flexDirection: "column", gap: "1rem", minHeight: "320px", maxHeight: "480px", overflowY: "auto" }}>
              {mensajes.length === 0 && (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center" }}>Sin respuestas aún. Sé el primero en responder.</p>
                </div>
              )}
              {mensajes.map((msg) => {
                const esCliente = msg.autor?.rol === "cliente";
                return (
                  <div key={msg.id} style={{ display: "flex", gap: "0.6rem", flexDirection: esCliente ? "row" : "row-reverse" }}>
                    <Avatar nombre={msg.autor?.nombre ?? "?"} size={26} />
                    <div style={{ maxWidth: "70%", display: "flex", flexDirection: "column", gap: "0.2rem", alignItems: esCliente ? "flex-start" : "flex-end" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        {!esCliente && <span style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>{fmtHora(msg.creadoEn)}</span>}
                        <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "var(--text-secondary)" }}>{msg.autor?.nombre}</span>
                        {esCliente && <span style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>{fmtHora(msg.creadoEn)}</span>}
                      </div>
                      <div style={{
                        padding: "0.6rem 0.9rem", borderRadius: esCliente ? "4px 14px 14px 14px" : "14px 4px 14px 14px",
                        background: esCliente ? "var(--bg-soft)" : "var(--verde)",
                        border: esCliente ? "1px solid var(--border)" : "none",
                        color: esCliente ? "var(--text-primary)" : "#fff",
                        fontSize: "0.82rem", lineHeight: 1.55, whiteSpace: "pre-wrap",
                      }}>
                        {msg.contenido}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            {ticket.estado !== "cerrado" && ticket.estado !== "resuelto" ? (
              <form onSubmit={handleEnviar} style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--border)", display: "flex", gap: "0.75rem", alignItems: "flex-end" }}>
                <textarea
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleEnviar(e as any); } }}
                  placeholder="Escribe una respuesta... (Enter para enviar, Shift+Enter nueva línea)"
                  rows={2}
                  style={{ flex: 1, padding: "0.65rem 0.9rem", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--bg-soft)", color: "var(--text-primary)", fontSize: "0.82rem", resize: "none", outline: "none", fontFamily: "inherit" }}
                />
                <button type="submit" disabled={enviando || !texto.trim()} style={{ padding: "0.6rem 1.2rem", borderRadius: "10px", background: "var(--verde)", border: "none", color: "#fff", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", opacity: (enviando || !texto.trim()) ? 0.6 : 1, flexShrink: 0 }}>
                  {enviando ? "..." : "Enviar"}
                </button>
              </form>
            ) : (
              <div style={{ padding: "0.75rem 1.5rem", borderTop: "1px solid var(--border)", textAlign: "center" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Este ticket está {ticket.estado === "cerrado" ? "cerrado" : "resuelto"}</span>
              </div>
            )}
          </div>

          {/* ── Panel lateral ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>

            {/* Estado */}
            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1rem" }}>
              <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 0.6rem" }}>Estado</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                {ESTADOS.map((e) => (
                  <button
                    key={e.key}
                    onClick={() => ticket.estado !== e.key && handleEstado(e.key)}
                    style={{
                      display: "flex", alignItems: "center", gap: "0.5rem",
                      padding: "0.45rem 0.7rem", borderRadius: "8px", border: "1px solid",
                      borderColor: ticket.estado === e.key ? e.color : "var(--border)",
                      background: ticket.estado === e.key ? `${e.color}14` : "transparent",
                      cursor: ticket.estado === e.key ? "default" : "pointer",
                      fontSize: "0.78rem", fontWeight: 600,
                      color: ticket.estado === e.key ? e.color : "var(--text-secondary)",
                      textAlign: "left", transition: "all 0.15s",
                    }}
                  >
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: e.color, flexShrink: 0 }} />
                    {e.label}
                    {ticket.estado === e.key && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 12, height: 12, marginLeft: "auto" }}><polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  </button>
                ))}
              </div>
            </div>

            {/* Asignar */}
            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1rem" }}>
              <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 0.6rem" }}>Asignado a</p>
              {ticket.asignadoA ? (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
                  <Avatar nombre={ticket.asignadoA.nombre} size={24} />
                  <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-primary)", flex: 1 }}>{ticket.asignadoA.nombre}</span>
                  <button onClick={() => handleAsignar(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "0.75rem", padding: 0 }}>✕</button>
                </div>
              ) : (
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "0 0 0.6rem" }}>Sin asignar</p>
              )}
              <select
                value={ticket.asignadoA?.id ?? ""}
                onChange={(e) => handleAsignar(e.target.value || null)}
                style={{ width: "100%", padding: "0.45rem 0.65rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-soft)", color: "var(--text-primary)", fontSize: "0.78rem", outline: "none" }}
              >
                <option value="">— Sin asignar —</option>
                {equipo.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
              </select>
            </div>

            {/* Info ticket */}
            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.55rem" }}>
              <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>Info del ticket</p>
              <Row label="Prioridad">
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: PRIORIDAD_COLOR[ticket.prioridad] ?? "#888", background: `${PRIORIDAD_COLOR[ticket.prioridad] ?? "#888"}14`, padding: "0.15rem 0.5rem", borderRadius: "6px" }}>{ticket.prioridad}</span>
              </Row>
              <Row label="Tipo">
                <span style={{ fontSize: "0.72rem", fontWeight: 600, color: tipoCfg.color }}>{tipoCfg.label}</span>
              </Row>
              {ticket.proyecto && (
                <Row label="Proyecto">
                  <span style={{ fontSize: "0.72rem", color: "var(--text-primary)", fontWeight: 600 }}>{ticket.proyecto.nombre}</span>
                </Row>
              )}
              <Row label="Cliente">
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Avatar nombre={ticket.cliente?.nombre ?? "C"} size={18} />
                  <span style={{ fontSize: "0.72rem", color: "var(--text-primary)" }}>{ticket.cliente?.nombre}</span>
                </div>
              </Row>
              <Row label="Email">
                <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>{ticket.cliente?.email}</span>
              </Row>
              <Row label="Creado">
                <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>{fmtFecha(ticket.creadoEn)}</span>
              </Row>
            </div>

            {/* Acción cerrar */}
            {ticket.estado !== "cerrado" && ticket.estado !== "resuelto" && (
              <button
                onClick={() => setConfirm({ open: true, title: "Cerrar ticket", message: "¿Marcar este ticket como resuelto y cerrarlo?", fn: () => handleEstado("resuelto") })}
                style={{ padding: "0.6rem 1rem", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text-secondary)", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}
              >
                Marcar como resuelto
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
      <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", flexShrink: 0 }}>{label}</span>
      <div style={{ textAlign: "right" }}>{children}</div>
    </div>
  );
}

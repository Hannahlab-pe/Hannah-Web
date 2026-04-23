"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { getTicket, getTicketMensajes, enviarMensajeTicket } from "@/libs/api";
import LoadingSpinner from "@/components/shared/loading-spinner";

const TIPO_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  comentario: { label: "Comentario",        color: "#6B7280", bg: "rgba(107,114,128,0.1)" },
  aporte:     { label: "Aporte/Sugerencia", color: "#2563EB", bg: "rgba(37,99,235,0.1)"  },
  incidencia: { label: "Incidencia",        color: "#D97706", bg: "rgba(217,119,6,0.1)"  },
  bug:        { label: "Bug",               color: "#DC2626", bg: "rgba(220,38,38,0.1)"  },
};
const ESTADO_INFO: Record<string, { label: string; color: string }> = {
  abierto:     { label: "Abierto",      color: "#f59e0b" },
  en_progreso: { label: "En progreso",  color: "#3b82f6" },
  resuelto:    { label: "Resuelto",     color: "#22c55e" },
  cerrado:     { label: "Cerrado",      color: "#6b7280" },
};

function fmtHora(fecha: string) {
  return new Date(fecha).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
}
function fmtFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
}

const AVATAR_COLORS = ["#4A8B00", "#0ea5e9", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4"];
function Avatar({ nombre, size = 28 }: { nombre: string; size?: number }) {
  const bg = AVATAR_COLORS[nombre.charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, color: "#fff", flexShrink: 0,
    }}>
      {nombre.trim().charAt(0).toUpperCase()}
    </div>
  );
}

export default function ClienteTicketDetallePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [ticket, setTicket] = useState<any>(null);
  const [mensajes, setMensajes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const cargar = useCallback(async () => {
    try {
      const [t, msgs] = await Promise.all([getTicket(id), getTicketMensajes(id)]);
      setTicket(t);
      setMensajes(msgs);
    } catch { toast.error("Error al cargar el ticket"); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  async function handleEnviar(e: React.FormEvent) {
    e.preventDefault();
    if (!texto.trim()) return;
    setEnviando(true);
    try {
      await enviarMensajeTicket(id, texto.trim());
      setTexto("");
      await cargar();
      toast.success("Mensaje enviado");
    } catch { toast.error("Error al enviar el mensaje"); }
    finally { setEnviando(false); }
  }

  if (loading) return <LoadingSpinner text="Cargando..." />;
  if (!ticket) return <div style={{ padding: "2rem", color: "#ef4444" }}>Ticket no encontrado</div>;

  const tipoCfg = TIPO_CONFIG[ticket.tipo] ?? TIPO_CONFIG.comentario;
  const estadoInfo = ESTADO_INFO[ticket.estado] ?? ESTADO_INFO.abierto;
  const cerrado = ticket.estado === "cerrado" || ticket.estado === "resuelto";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxWidth: "720px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
        <button
          onClick={() => router.push("/dashboard/soporte")}
          style={{ background: "var(--bg-soft)", border: "1px solid var(--border)", borderRadius: "8px", padding: "0.4rem 0.7rem", cursor: "pointer", color: "var(--text-secondary)", fontSize: "0.8rem", flexShrink: 0, marginTop: "2px" }}
        >
          ← Soporte
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <span style={{ padding: "0.18rem 0.55rem", borderRadius: "6px", fontSize: "0.67rem", fontWeight: 700, background: tipoCfg.bg, color: tipoCfg.color }}>
              {tipoCfg.label}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.18rem 0.55rem", borderRadius: "6px", fontSize: "0.67rem", fontWeight: 700, background: `${estadoInfo.color}14`, color: estadoInfo.color }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: estadoInfo.color }} />
              {estadoInfo.label}
            </span>
          </div>
          <h1 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-primary)", margin: "0.3rem 0 0" }}>{ticket.titulo}</h1>
          <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", margin: "0.15rem 0 0" }}>
            Creado el {fmtFecha(ticket.creadoEn)}
            {ticket.proyecto && <> · Proyecto: <strong style={{ color: "var(--text-secondary)" }}>{ticket.proyecto.nombre}</strong></>}
          </p>
        </div>
      </div>

      {/* Chat card */}
      <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden", display: "flex", flexDirection: "column" }}>

        {/* Descripción original */}
        <div style={{ padding: "1.1rem 1.35rem", borderBottom: "1px solid var(--border)", background: "var(--bg-soft)" }}>
          <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 0.5rem" }}>Tu reporte</p>
          <p style={{ fontSize: "0.83rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{ticket.descripcion}</p>
        </div>

        {/* Mensajes */}
        <div style={{ padding: "1rem 1.35rem", display: "flex", flexDirection: "column", gap: "1rem", minHeight: "260px", maxHeight: "440px", overflowY: "auto" }}>
          {mensajes.length === 0 ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "2rem 0" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 32, height: 32, color: "var(--text-muted)" }}>
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>El equipo Hannah responderá pronto.</p>
            </div>
          ) : (
            mensajes.map((msg) => {
              const esCliente = msg.autor?.rol === "cliente";
              return (
                <div key={msg.id} style={{ display: "flex", gap: "0.6rem", flexDirection: esCliente ? "row-reverse" : "row" }}>
                  {!esCliente && <Avatar nombre={msg.autor?.nombre ?? "H"} size={28} />}
                  <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", gap: "0.2rem", alignItems: esCliente ? "flex-end" : "flex-start" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      {esCliente && <span style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>{fmtHora(msg.creadoEn)}</span>}
                      <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                        {esCliente ? "Tú" : msg.autor?.nombre}
                      </span>
                      {!esCliente && <span style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>{fmtHora(msg.creadoEn)}</span>}
                    </div>
                    <div style={{
                      padding: "0.65rem 0.95rem",
                      borderRadius: esCliente ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
                      background: esCliente ? "var(--verde)" : "var(--bg-soft)",
                      border: esCliente ? "none" : "1px solid var(--border)",
                      color: esCliente ? "#fff" : "var(--text-primary)",
                      fontSize: "0.83rem", lineHeight: 1.55, whiteSpace: "pre-wrap",
                    }}>
                      {msg.contenido}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {!cerrado ? (
          <form onSubmit={handleEnviar} style={{ padding: "0.9rem 1.35rem", borderTop: "1px solid var(--border)", display: "flex", gap: "0.75rem", alignItems: "flex-end", background: "var(--bg-soft)" }}>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleEnviar(e as any); } }}
              placeholder="Añade más contexto o información... (Enter para enviar)"
              rows={2}
              style={{ flex: 1, padding: "0.65rem 0.9rem", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text-primary)", fontSize: "0.82rem", resize: "none", outline: "none", fontFamily: "inherit" }}
            />
            <button
              type="submit"
              disabled={enviando || !texto.trim()}
              style={{ padding: "0.65rem 1.3rem", borderRadius: "10px", background: "var(--verde)", border: "none", color: "#fff", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", opacity: (enviando || !texto.trim()) ? 0.6 : 1, flexShrink: 0 }}
            >
              {enviando ? "..." : "Enviar"}
            </button>
          </form>
        ) : (
          <div style={{ padding: "0.85rem 1.35rem", borderTop: "1px solid var(--border)", textAlign: "center", background: "var(--bg-soft)" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Este ticket fue {ticket.estado === "cerrado" ? "cerrado" : "marcado como resuelto"}. Si necesitas ayuda adicional, crea un nuevo reporte.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

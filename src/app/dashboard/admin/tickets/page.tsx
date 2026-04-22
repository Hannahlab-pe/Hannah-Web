"use client";

import { useState, useEffect } from "react";
import { getAdminTickets, responderTicket } from "@/libs/api";
import LoadingSpinner from "@/components/shared/loading-spinner";
import PageHeader from "@/components/shared/page-header";

const PRIORIDAD_COLOR: Record<string, string> = {
  baja: "#22c55e", media: "#f59e0b", alta: "#ef4444", urgente: "#dc2626",
};
const ESTADO_COLOR: Record<string, string> = {
  abierto: "#f59e0b", en_progreso: "var(--verde)", respondido: "#3b82f6", cerrado: "#6b7280",
};

function Chip({ label, color }: { label: string; color: string }) {
  return (
    <span style={{ display: "inline-flex", padding: "0.15rem 0.5rem", borderRadius: "999px", fontSize: "0.65rem", fontWeight: 600, background: `${color}18`, color, border: `1px solid ${color}` }}>
      {label}
    </span>
  );
}

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandido, setExpandido] = useState<string | null>(null);
  const [respuesta, setRespuesta] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function cargar() {
    setLoading(true);
    try { setTickets(await getAdminTickets()); } catch { /* silencioso */ }
    setLoading(false);
  }

  useEffect(() => { cargar(); }, []);

  async function enviarRespuesta(id: string) {
    if (!respuesta.trim()) return;
    setEnviando(true);
    try {
      await responderTicket(id, respuesta);
      setRespuesta("");
      setExpandido(null);
      cargar();
    } catch { /* silencioso */ }
    setEnviando(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <PageHeader
        title="Tickets de soporte"
        subtitle={`${tickets.length} ticket${tickets.length !== 1 ? "s" : ""}`}
      />

      {loading ? (
        <LoadingSpinner text="Cargando tickets..." />
      ) : tickets.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center", padding: "3rem 0" }}>No hay tickets.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {tickets.map((t) => (
            <div key={t.id} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
              <div style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem", cursor: "pointer", flexWrap: "wrap" }}
                onClick={() => setExpandido(expandido === t.id ? null : t.id)}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text-primary)", margin: 0 }}>{t.titulo}</p>
                  {t.cliente && <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", margin: "0.15rem 0 0" }}>{t.cliente.nombre} · {t.cliente.email}</p>}
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0, flexWrap: "wrap" }}>
                  <Chip label={t.prioridad} color={PRIORIDAD_COLOR[t.prioridad] ?? "#888"} />
                  <Chip label={t.estado.replace("_", " ")} color={ESTADO_COLOR[t.estado] ?? "#888"} />
                </div>
              </div>
              {expandido === t.id && (
                <div style={{ padding: "0 1.25rem 1.25rem", borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "1rem", lineHeight: 1.6 }}>{t.descripcion}</p>
                  {t.respuesta && (
                    <div style={{ background: "rgba(74,139,0,0.06)", border: "1px solid var(--verde)", borderRadius: "8px", padding: "0.75rem", marginBottom: "1rem" }}>
                      <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--verde)", margin: "0 0 0.3rem" }}>Respuesta actual:</p>
                      <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", margin: 0 }}>{t.respuesta}</p>
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <textarea rows={3} placeholder="Escribe una respuesta..." value={respuesta} onChange={(e) => setRespuesta(e.target.value)} style={{ padding: "0.6rem 0.75rem", borderRadius: "8px", fontSize: "0.8rem", border: "1px solid var(--border)", background: "var(--bg-soft)", color: "var(--text-primary)", resize: "vertical", outline: "none" }} />
                    <button onClick={() => enviarRespuesta(t.id)} disabled={enviando || !respuesta.trim()} style={{ alignSelf: "flex-end", padding: "0.45rem 1rem", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 600, background: "var(--verde)", border: "none", color: "#fff", cursor: "pointer", opacity: (enviando || !respuesta.trim()) ? 0.6 : 1 }}>
                      {enviando ? "Enviando..." : "Responder"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

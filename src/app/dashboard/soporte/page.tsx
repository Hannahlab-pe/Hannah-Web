"use client";

import { useState, useEffect } from "react";
import { getMisTickets, crearTicket } from "@/libs/api";
import LoadingSpinner from "@/components/shared/loading-spinner";

const headingFont = "'Google Sans', system-ui";
const bodyFont = "'Outfit', sans-serif";

const PRIORIDAD_STYLE: Record<string, { bg: string; color: string }> = {
  alta:  { bg: "rgba(229,62,62,0.1)",   color: "#E53E3E" },
  media: { bg: "rgba(221,167,32,0.1)",  color: "#D69E2E" },
  baja:  { bg: "rgba(113,128,150,0.1)", color: "#718096" },
};

const ESTADO_STYLE: Record<string, { bg: string; color: string; dot: string }> = {
  abierto:      { bg: "rgba(49,130,206,0.1)",  color: "#3182CE", dot: "#3182CE" },
  pendiente:    { bg: "rgba(49,130,206,0.1)",  color: "#3182CE", dot: "#3182CE" },
  en_progreso:  { bg: "rgba(221,167,32,0.1)",  color: "#D69E2E", dot: "#D69E2E" },
  respondido:   { bg: "rgba(56,161,105,0.1)",  color: "#38A169", dot: "#38A169" },
  resuelto:     { bg: "rgba(56,161,105,0.1)",  color: "#38A169", dot: "#38A169" },
  cerrado:      { bg: "rgba(113,128,150,0.1)", color: "#718096", dot: "#718096" },
};

function fmt(fecha: string) {
  return new Date(fecha).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
}

function ModalNuevoTicket({ onClose, onCreado }: { onClose: () => void; onCreado: () => void }) {
  const [form, setForm] = useState({ titulo: "", descripcion: "", prioridad: "media" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await crearTicket(form);
      onCreado();
      onClose();
    } catch (err: any) {
      setError(err.message ?? "Error al crear ticket");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    padding: "0.6rem 0.85rem", borderRadius: "8px", fontSize: "0.82rem",
    border: "1px solid var(--border)", background: "var(--bg-soft)",
    color: "var(--text-primary)", outline: "none", width: "100%",
    boxSizing: "border-box", fontFamily: bodyFont,
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "var(--bg)", borderRadius: "16px", padding: "2rem", width: "100%", maxWidth: "480px", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", margin: 0, fontFamily: headingFont }}>Nuevo ticket</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "1.2rem" }}>✕</button>
        </div>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid #ef4444", borderRadius: "8px", padding: "0.6rem 0.9rem", fontSize: "0.75rem", color: "#ef4444", fontFamily: bodyFont }}>{error}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", fontFamily: bodyFont, display: "block", marginBottom: "0.35rem" }}>
              Asunto <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input required value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} style={inputStyle} placeholder="Describe brevemente el problema" />
          </div>

          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", fontFamily: bodyFont, display: "block", marginBottom: "0.35rem" }}>
              Descripcion <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <textarea required value={form.descripcion} onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))} rows={4} style={{ ...inputStyle, resize: "vertical" }} placeholder="Describe con detalle el problema o solicitud..." />
          </div>

          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", fontFamily: bodyFont, display: "block", marginBottom: "0.35rem" }}>Prioridad</label>
            <select value={form.prioridad} onChange={(e) => setForm((f) => ({ ...f, prioridad: e.target.value }))} style={inputStyle}>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={{ padding: "0.55rem 1.2rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-soft)", color: "var(--text-secondary)", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", fontFamily: bodyFont }}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} style={{ padding: "0.55rem 1.4rem", borderRadius: "8px", border: "none", background: "var(--verde)", color: "#fff", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", fontFamily: bodyFont, opacity: loading ? 0.7 : 1 }}>
              {loading ? "Enviando..." : "Crear ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type FilterType = "Todos" | string;

export default function SoportePage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("Todos");
  const [modalOpen, setModalOpen] = useState(false);

  function load() {
    setLoading(true);
    getMisTickets()
      .then(setTickets)
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  const abiertos   = tickets.filter((t) => t.estado === "abierto" || t.estado === "pendiente").length;
  const enProgreso = tickets.filter((t) => t.estado === "en_progreso").length;
  const resueltos  = tickets.filter((t) => t.estado === "resuelto" || t.estado === "respondido" || t.estado === "cerrado").length;

  const filtered = filter === "Todos" ? tickets : tickets.filter((t) => {
    if (filter === "Abierto") return t.estado === "abierto" || t.estado === "pendiente";
    if (filter === "En progreso") return t.estado === "en_progreso";
    if (filter === "Resuelto") return t.estado === "resuelto" || t.estado === "respondido" || t.estado === "cerrado";
    return true;
  });

  const statusFilters = ["Todos", "Abierto", "En progreso", "Resuelto"];

  return (
    <div>
      {modalOpen && <ModalNuevoTicket onClose={() => setModalOpen(false)} onCreado={load} />}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem", fontFamily: headingFont }}>Soporte</h1>
          <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontFamily: bodyFont }}>Tickets y comunicacion con el equipo</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1.25rem", borderRadius: "10px", border: "none", background: "var(--verde)", color: "#fff", fontSize: "0.875rem", fontWeight: 600, fontFamily: bodyFont, cursor: "pointer" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "16px", height: "16px" }}>
            <path d="M12 4.5v15m7.5-7.5h-15" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Nuevo ticket
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
        {[
          { label: "Abiertos",    value: abiertos,   color: "#3182CE", bg: "rgba(49,130,206,0.08)" },
          { label: "En progreso", value: enProgreso,  color: "#D69E2E", bg: "rgba(221,167,32,0.08)" },
          { label: "Resueltos",   value: resueltos,   color: "#38A169", bg: "rgba(56,161,105,0.08)" },
        ].map((s) => (
          <div key={s.label} style={{ padding: "1.25rem", borderRadius: "14px", background: "var(--bg)", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <span style={{ fontSize: "2rem", fontWeight: 700, color: s.color, fontFamily: headingFont }}>{loading ? "—" : s.value}</span>
            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", fontFamily: bodyFont }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        {statusFilters.map((s) => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: "0.45rem 1rem", borderRadius: "8px", border: "1px solid",
            borderColor: filter === s ? "var(--verde)" : "var(--border)",
            background: filter === s ? "rgba(74,139,0,0.1)" : "var(--bg)",
            color: filter === s ? "var(--verde)" : "var(--text-secondary)",
            fontSize: "0.82rem", fontWeight: 500, cursor: "pointer", fontFamily: bodyFont,
          }}>
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner text="Cargando tickets..." />
      ) : filtered.length === 0 ? (
        <div style={{ padding: "3rem", textAlign: "center", borderRadius: "16px", border: "1px dashed var(--border)" }}>
          <p style={{ color: "var(--text-muted)", fontFamily: bodyFont }}>No hay tickets en esta categoria.</p>
        </div>
      ) : (
        <div style={{ borderRadius: "16px", border: "1px solid var(--border)", background: "var(--bg)", overflow: "hidden" }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 100px 110px 120px", padding: "0.85rem 1.25rem", borderBottom: "1px solid var(--border)", background: "var(--bg-soft)", gap: "0.75rem" }}>
            {["#", "Asunto", "Prioridad", "Estado", "Fecha"].map((h) => (
              <span key={h} style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: bodyFont }}>{h}</span>
            ))}
          </div>
          {filtered.map((t, idx) => {
            const ps = PRIORIDAD_STYLE[t.prioridad?.toLowerCase()] ?? PRIORIDAD_STYLE.media;
            const es = ESTADO_STYLE[t.estado?.toLowerCase()] ?? ESTADO_STYLE.abierto;
            return (
              <div key={t.id} style={{
                display: "grid", gridTemplateColumns: "80px 1fr 100px 110px 120px",
                padding: "0.9rem 1.25rem", gap: "0.75rem", alignItems: "center",
                borderBottom: idx < filtered.length - 1 ? "1px solid var(--border-light)" : "none",
              }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", fontFamily: bodyFont }}>
                  #{String(t.id).slice(-4).toUpperCase()}
                </span>
                <div>
                  <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", margin: 0, fontFamily: headingFont }}>{t.titulo}</p>
                  {t.respuesta && (
                    <p style={{ fontSize: "0.72rem", color: "var(--verde)", margin: "0.15rem 0 0", fontFamily: bodyFont }}>Respondido por el equipo</p>
                  )}
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", padding: "0.25rem 0.6rem", borderRadius: "6px", fontSize: "0.72rem", fontWeight: 600, background: ps.bg, color: ps.color, fontFamily: bodyFont, width: "fit-content" }}>
                  {t.prioridad}
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.25rem 0.6rem", borderRadius: "6px", fontSize: "0.72rem", fontWeight: 600, background: es.bg, color: es.color, fontFamily: bodyFont, width: "fit-content" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: es.dot, flexShrink: 0 }} />
                  {t.estado?.replace("_", " ")}
                </span>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontFamily: bodyFont }}>
                  {fmt(t.creadoEn ?? t.createdAt)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
